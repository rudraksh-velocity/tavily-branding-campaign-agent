import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file at startup
env_path = Path(__file__).parent / '.env'
if env_path.exists():
    load_dotenv(dotenv_path=env_path, override=True)

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
from backend.graph import Graph
from backend.services.websocket_manager import WebSocketManager
from backend.services.document_service import DocumentService
import logging
import uvicorn
from datetime import datetime
import asyncio
import uuid
from collections import defaultdict
from backend.services.mongodb import MongoDBService
from backend.services.pdf_service import PDFService

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)
console_handler = logging.StreamHandler()
logger.addHandler(console_handler)

app = FastAPI(title="Brand DNA Engine API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

manager = WebSocketManager()
pdf_service = PDFService({"pdf_output_dir": "pdfs"})
document_service = DocumentService()

job_status = defaultdict(lambda: {
    "status": "pending",
    "result": None,
    "error": None,
    "debug_info": [],
    "company": None,
    "report": None,
    "analysis_type": "company_research",
    "last_update": datetime.now().isoformat()
})

mongodb = None
if mongo_uri := os.getenv("MONGODB_URI"):
    try:
        mongodb = MongoDBService(mongo_uri)
        logger.info("MongoDB integration enabled")
    except Exception as e:
        logger.warning(f"Failed to initialize MongoDB: {e}. Continuing without persistence.")

class ResearchRequest(BaseModel):
    company: str
    company_url: str | None = None
    industry: str | None = None
    hq_location: str | None = None
    analysis_type: str = "company_research"  # "company_research" or "brand_dna"

class BrandDNARequest(BaseModel):
    company: str
    company_url: str | None = None
    industry: str | None = None
    hq_location: str | None = None
    analysis_type: str = "brand_dna"

class PDFGenerationRequest(BaseModel):
    report_content: str
    company_name: str | None = None

class GeneratePDFRequest(BaseModel):
    report_content: str
    company_name: str | None = None

@app.options("/research")
async def preflight():
    response = JSONResponse(content=None, status_code=200)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response

@app.options("/brand-dna")
async def preflight_brand_dna():
    response = JSONResponse(content=None, status_code=200)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response

@app.post("/research")
async def research(data: ResearchRequest):
    try:
        logger.info(f"Received research request for {data.company} (Type: {data.analysis_type})")
        job_id = str(uuid.uuid4())
        asyncio.create_task(process_research(job_id, data))

        response = JSONResponse(content={
            "status": "accepted",
            "job_id": job_id,
            "message": f"{data.analysis_type.replace('_', ' ').title()} analysis started. Connect to WebSocket for updates.",
            "websocket_url": f"/research/ws/{job_id}",
            "analysis_type": data.analysis_type
        })
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response

    except Exception as e:
        logger.error(f"Error initiating research: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/brand-dna")
async def brand_dna_analysis(
    company: str = Form(...),
    company_url: Optional[str] = Form(None),
    industry: Optional[str] = Form(None),
    hq_location: Optional[str] = Form(None),
    files: List[UploadFile] = File(default=[])
):
    try:
        logger.info(f"Received Brand DNA analysis request for {company} with {len(files)} files")
        
        # Process uploaded files
        uploaded_documents = []
        if files:
            for file in files:
                if file.filename:  # Skip empty file uploads
                    try:
                        # Validate file
                        if not document_service.validate_file(file.filename, 0):  # Size will be checked during processing
                            logger.warning(f"Skipping unsupported file: {file.filename}")
                            continue
                        
                        # Process file
                        doc_data = await document_service.process_uploaded_file(file)
                        uploaded_documents.append(doc_data)
                        logger.info(f"Processed file: {file.filename} ({doc_data['character_count']} chars)")
                    except Exception as e:
                        logger.error(f"Error processing file {file.filename}: {str(e)}")
                        # Continue with other files instead of failing completely
                        continue
        
        # Create research request
        data = BrandDNARequest(
            company=company,
            company_url=company_url,
            industry=industry,
            hq_location=hq_location,
            analysis_type="brand_dna"
        )
        
        job_id = str(uuid.uuid4())
        asyncio.create_task(process_brand_dna_research(job_id, data, uploaded_documents))

        response = JSONResponse(content={
            "status": "accepted",
            "job_id": job_id,
            "message": f"Brand DNA analysis started with {len(uploaded_documents)} documents. Connect to WebSocket for updates.",
            "websocket_url": f"/research/ws/{job_id}",
            "analysis_type": "brand_dna",
            "uploaded_files": len(uploaded_documents)
        })
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response

    except Exception as e:
        logger.error(f"Error initiating Brand DNA analysis: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

async def process_research(job_id: str, data: ResearchRequest):
    try:
        if mongodb:
            mongodb.create_job(job_id, data.dict())
        await asyncio.sleep(1)  # Allow WebSocket connection

        job_status[job_id]["analysis_type"] = data.analysis_type
        await manager.send_status_update(job_id, status="processing", message=f"Starting {data.analysis_type.replace('_', ' ')}")

        graph = Graph(
            company=data.company,
            url=data.company_url,
            industry=data.industry,
            hq_location=data.hq_location,
            analysis_type=data.analysis_type,
            websocket_manager=manager,
            job_id=job_id
        )

        state = {}
        async for s in graph.run(thread={}):
            state.update(s)
        
        # Look for the compiled report in either location.
        report_content = state.get('report') or (state.get('editor') or {}).get('report')
        if report_content:
            logger.info(f"Found report in final state (length: {len(report_content)})")
            job_status[job_id].update({
                "status": "completed",
                "report": report_content,
                "company": data.company,
                "analysis_type": data.analysis_type,
                "last_update": datetime.now().isoformat()
            })
            if mongodb:
                mongodb.update_job(job_id=job_id, status="completed")
                mongodb.store_report(job_id=job_id, report_data={"report": report_content})
            await manager.send_status_update(
                job_id=job_id,
                status="completed",
                message=f"{data.analysis_type.replace('_', ' ').title()} completed successfully",
                result={
                    "report": report_content,
                    "company": data.company,
                    "analysis_type": data.analysis_type
                }
            )
        else:
            logger.error(f"Research completed without finding report. State keys: {list(state.keys())}")
            logger.error(f"Editor state: {state.get('editor', {})}")
            
            # Check if there was a specific error in the state
            error_message = "No report found"
            if error := state.get('error'):
                error_message = f"Error: {error}"
            
            await manager.send_status_update(
                job_id=job_id,
                status="failed",
                message="Analysis completed but no report was generated",
                error=error_message
            )

    except Exception as e:
        logger.error(f"Research failed: {str(e)}")
        await manager.send_status_update(
            job_id=job_id,
            status="failed",
            message=f"Analysis failed: {str(e)}",
            error=str(e)
        )
        if mongodb:
            mongodb.update_job(job_id=job_id, status="failed", error=str(e))

async def process_brand_dna_research(job_id: str, data: BrandDNARequest, uploaded_documents: List[dict]):
    try:
        if mongodb:
            job_data = data.dict()
            job_data['uploaded_files'] = len(uploaded_documents)
            mongodb.create_job(job_id, job_data)
        await asyncio.sleep(1)  # Allow WebSocket connection

        job_status[job_id]["analysis_type"] = "brand_dna"
        await manager.send_status_update(
            job_id, 
            status="processing", 
            message=f"Starting Brand DNA analysis with {len(uploaded_documents)} uploaded documents"
        )

        graph = Graph(
            company=data.company,
            url=data.company_url,
            industry=data.industry,
            hq_location=data.hq_location,
            analysis_type="brand_dna",
            uploaded_documents=uploaded_documents,
            websocket_manager=manager,
            job_id=job_id
        )

        state = {}
        async for s in graph.run(thread={}):
            state.update(s)
        
        # Look for the compiled report in either location.
        report_content = state.get('report') or (state.get('editor') or {}).get('report')
        if report_content:
            logger.info(f"Found Brand DNA report in final state (length: {len(report_content)})")
            job_status[job_id].update({
                "status": "completed",
                "report": report_content,
                "company": data.company,
                "analysis_type": "brand_dna",
                "uploaded_files": len(uploaded_documents),
                "last_update": datetime.now().isoformat()
            })
            if mongodb:
                mongodb.update_job(job_id=job_id, status="completed")
                mongodb.store_report(job_id=job_id, report_data={"report": report_content})
            await manager.send_status_update(
                job_id=job_id,
                status="completed",
                message="Brand DNA analysis completed successfully",
                result={
                    "report": report_content,
                    "company": data.company,
                    "analysis_type": "brand_dna",
                    "uploaded_files": len(uploaded_documents)
                }
            )
        else:
            logger.error(f"Brand DNA analysis completed without finding report. State keys: {list(state.keys())}")
            logger.error(f"Editor state: {state.get('editor', {})}")
            
            # Check if there was a specific error in the state
            error_message = "No report found"
            if error := state.get('error'):
                error_message = f"Error: {error}"
            
            await manager.send_status_update(
                job_id=job_id,
                status="failed",
                message="Brand DNA analysis completed but no report was generated",
                error=error_message
            )

    except Exception as e:
        logger.error(f"Brand DNA analysis failed: {str(e)}")
        await manager.send_status_update(
            job_id=job_id,
            status="failed",
            message=f"Brand DNA analysis failed: {str(e)}",
            error=str(e)
        )
        if mongodb:
            mongodb.update_job(job_id=job_id, status="failed", error=str(e))

@app.get("/")
async def ping():
    return {"message": "Brand DNA Engine - Alive"}

@app.get("/supported-file-types")
async def get_supported_file_types():
    """Get list of supported file types for upload"""
    return {
        "supported_types": document_service.get_supported_types(),
        "max_file_size_mb": document_service.max_file_size / (1024 * 1024)
    }

@app.get("/research/pdf/{filename}")
async def get_pdf(filename: str):
    pdf_path = os.path.join("pdfs", filename)
    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail="PDF not found")
    return FileResponse(pdf_path, media_type='application/pdf', filename=filename)

@app.websocket("/research/ws/{job_id}")
async def websocket_endpoint(websocket: WebSocket, job_id: str):
    try:
        await websocket.accept()
        await manager.connect(websocket, job_id)

        if job_id in job_status:
            status = job_status[job_id]
            await manager.send_status_update(
                job_id,
                status=status["status"],
                message="Connected to status stream",
                error=status["error"],
                result=status["result"]
            )

        while True:
            try:
                await websocket.receive_text()
            except WebSocketDisconnect:
                manager.disconnect(websocket, job_id)
                break

    except Exception as e:
        logger.error(f"WebSocket error for job {job_id}: {str(e)}", exc_info=True)
        manager.disconnect(websocket, job_id)

@app.get("/research/{job_id}")
async def get_research(job_id: str):
    if not mongodb:
        raise HTTPException(status_code=501, detail="Database persistence not configured")
    job = mongodb.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Research job not found")
    return job

@app.get("/research/{job_id}/report")
async def get_research_report(job_id: str):
    if not mongodb:
        if job_id in job_status:
            result = job_status[job_id]
            if report := result.get("report"):
                return {"report": report}
        raise HTTPException(status_code=404, detail="Report not found")
    
    report = mongodb.get_report(job_id)
    if not report:
        raise HTTPException(status_code=404, detail="Research report not found")
    return report

@app.post("/research/{job_id}/generate-pdf")
async def generate_pdf(job_id: str):
    return pdf_service.generate_pdf_from_job(job_id, job_status, mongodb)

@app.post("/generate-pdf")
async def generate_pdf(data: GeneratePDFRequest):
    """Generate a PDF from markdown content and stream it to the client."""
    try:
        success, result = pdf_service.generate_pdf_stream(data.report_content, data.company_name)
        if success:
            pdf_buffer, filename = result
            return StreamingResponse(
                pdf_buffer,
                media_type='application/pdf',
                headers={
                    'Content-Disposition': f'attachment; filename="{filename}"'
                }
            )
        else:
            raise HTTPException(status_code=500, detail=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
