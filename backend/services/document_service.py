import PyPDF2
import docx
import io
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

class DocumentService:
    def __init__(self):
        self.supported_types = ['.pdf', '.docx', '.txt']
        self.max_file_size = 10 * 1024 * 1024  # 10MB
    
    async def process_uploaded_file(self, file) -> Dict[str, Any]:
        """Extract text content from uploaded files"""
        try:
            content = ""
            filename = file.filename
            file_size = 0
            
            # Read file content
            file_content = await file.read()
            file_size = len(file_content)
            
            if file_size > self.max_file_size:
                raise ValueError(f"File {filename} exceeds maximum size of 10MB")
            
            if filename.endswith('.pdf'):
                content = await self.extract_pdf_text(file_content)
            elif filename.endswith('.docx'):
                content = await self.extract_docx_text(file_content)
            elif filename.endswith('.txt'):
                content = file_content.decode('utf-8')
            else:
                raise ValueError(f"Unsupported file type: {filename}")
            
            logger.info(f"Processed file {filename}: {len(content)} characters extracted")
            
            return {
                'filename': filename,
                'content': content,
                'file_type': filename.split('.')[-1],
                'size': file_size,
                'character_count': len(content)
            }
            
        except Exception as e:
            logger.error(f"Error processing file {filename}: {str(e)}")
            raise ValueError(f"Failed to process file {filename}: {str(e)}")
    
    async def extract_pdf_text(self, file_content: bytes) -> str:
        """Extract text from PDF file"""
        try:
            pdf_file = io.BytesIO(file_content)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            
            text = ""
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                text += page.extract_text() + "\n"
            
            return text.strip()
            
        except Exception as e:
            logger.error(f"Error extracting PDF text: {str(e)}")
            raise ValueError(f"Failed to extract text from PDF: {str(e)}")
    
    async def extract_docx_text(self, file_content: bytes) -> str:
        """Extract text from DOCX file"""
        try:
            docx_file = io.BytesIO(file_content)
            doc = docx.Document(docx_file)
            
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            
            return text.strip()
            
        except Exception as e:
            logger.error(f"Error extracting DOCX text: {str(e)}")
            raise ValueError(f"Failed to extract text from DOCX: {str(e)}")
    
    def validate_file(self, filename: str, file_size: int) -> bool:
        """Validate file type and size"""
        if file_size > self.max_file_size:
            return False
        
        file_extension = '.' + filename.split('.')[-1].lower()
        return file_extension in self.supported_types
    
    def get_supported_types(self) -> List[str]:
        """Get list of supported file types"""
        return self.supported_types.copy()
