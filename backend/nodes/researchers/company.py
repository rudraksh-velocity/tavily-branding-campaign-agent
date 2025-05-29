from langchain_core.messages import AIMessage
from typing import Dict, Any

from ...classes import ResearchState
from .base import BaseResearcher

class CompanyAnalyzer(BaseResearcher):
    def __init__(self) -> None:
        super().__init__()
        self.analyst_type = "company_analyzer"

    async def analyze(self, state: ResearchState) -> Dict[str, Any]:
        company = state.get('company', 'Unknown Company')
        analysis_type = state.get('analysis_type', 'company_research')
        
        if analysis_type == 'brand_dna':
            msg = [f"🧬 Brand DNA Analyzer analyzing {company}"]
            # Brand DNA focused queries
            queries = await self.generate_queries(state, """
            Generate queries for brand DNA analysis of {company}:
            - Brand values and mission statements
            - Brand voice and messaging consistency
            - Brand positioning and differentiation
            - Company culture and employee brand perception
            - Brand guidelines and visual identity standards
            - Brand reputation and public perception
            """)
        else:
            msg = [f"🏢 Company Analyzer analyzing {company}"]
            # Original company research queries
            queries = await self.generate_queries(state, """
            Generate queries on the company fundamentals of {company} in the {industry} industry such as:
            - Core products and services
            - Company history and milestones
            - Leadership team
            - Business model and strategy
            """)

        # Add message to show subqueries with emojis
        subqueries_msg = "🔍 Subqueries for company analysis:\n" + "\n".join([f"• {query}" for query in queries])
        messages = state.get('messages', [])
        messages.append(AIMessage(content=subqueries_msg))
        state['messages'] = messages

        # Send queries through WebSocket
        if websocket_manager := state.get('websocket_manager'):
            if job_id := state.get('job_id'):
                await websocket_manager.send_status_update(
                    job_id=job_id,
                    status="processing",
                    message=f"Company analysis queries generated",
                    result={
                        "step": "Company Analyst",
                        "analyst_type": "Company Analyst",
                        "queries": queries
                    }
                )
        
        company_data = {}
        
        # Process uploaded brand documents first
        if uploaded_docs := state.get('uploaded_documents', []):
            msg.append(f"\n📄 Processing {len(uploaded_docs)} uploaded brand documents...")
            for doc in uploaded_docs:
                doc_key = f"uploaded_{doc['filename']}"
                company_data[doc_key] = {
                    'title': f"Brand Document: {doc['filename']}",
                    'raw_content': doc['content'],
                    'query': 'Brand asset analysis',
                    'source_type': 'uploaded_document',
                    'file_type': doc.get('file_type', 'unknown'),
                    'character_count': doc.get('character_count', 0)
                }
            
            if websocket_manager := state.get('websocket_manager'):
                if job_id := state.get('job_id'):
                    await websocket_manager.send_status_update(
                        job_id=job_id,
                        status="processing",
                        message=f"Processed {len(uploaded_docs)} uploaded brand documents",
                        result={
                            "step": "Document Processing",
                            "analyst_type": "Company Analyst",
                            "uploaded_files": len(uploaded_docs)
                        }
                    )
        
        # If we have site_scrape data, include it
        if site_scrape := state.get('site_scrape'):
            msg.append("\n📊 Including site scrape data in company analysis...")
            company_url = state.get('company_url', 'company-website')
            company_data[company_url] = {
                'title': state.get('company', 'Unknown Company'),
                'raw_content': site_scrape,
                'query': f'Company overview and information about {company}',
                'source_type': 'website_scrape'
            }
        
        # Perform additional research with comprehensive search
        try:
            # Store documents with their respective queries
            for query in queries:
                documents = await self.search_documents(state, [query])
                if documents:  # Only process if we got results
                    for url, doc in documents.items():
                        doc['query'] = query  # Associate each document with its query
                        doc['source_type'] = 'external_search'
                        company_data[url] = doc
            
            msg.append(f"\n✓ Found {len(company_data)} total documents")
            if websocket_manager := state.get('websocket_manager'):
                if job_id := state.get('job_id'):
                    await websocket_manager.send_status_update(
                        job_id=job_id,
                        status="processing",
                        message=f"Used Tavily Search to find {len(company_data)} total documents",
                        result={
                            "step": "Searching",
                            "analyst_type": "Company Analyst",
                            "queries": queries,
                            "total_documents": len(company_data)
                        }
                    )
        except Exception as e:
            msg.append(f"\n⚠️ Error during research: {str(e)}")
        
        # Update state with our findings
        messages = state.get('messages', [])
        messages.append(AIMessage(content="\n".join(msg)))
        state['messages'] = messages
        state['company_data'] = company_data
        
        return {
            'message': msg,
            'company_data': company_data
        }

    async def run(self, state: ResearchState) -> Dict[str, Any]:
        return await self.analyze(state)
