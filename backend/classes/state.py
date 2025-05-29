from typing import TypedDict, Dict, List, Any
try:
    from typing import NotRequired, Required
except ImportError:
    from typing_extensions import NotRequired, Required
from backend.services.websocket_manager import WebSocketManager

#Define the input state
class InputState(TypedDict, total=False):
    company: Required[str]
    company_url: NotRequired[str]
    hq_location: NotRequired[str]
    industry: NotRequired[str]
    websocket_manager: NotRequired[WebSocketManager]
    job_id: NotRequired[str]
    # Brand DNA additions
    uploaded_documents: NotRequired[List[Dict[str, Any]]]
    analysis_type: NotRequired[str]  # "brand_dna" or "company_research"

class ResearchState(InputState):
    site_scrape: Dict[str, Any]
    messages: List[Any]
    financial_data: Dict[str, Any]
    news_data: Dict[str, Any]
    industry_data: Dict[str, Any]
    company_data: Dict[str, Any]
    curated_financial_data: Dict[str, Any]
    curated_news_data: Dict[str, Any]
    curated_industry_data: Dict[str, Any]
    curated_company_data: Dict[str, Any]
    financial_briefing: str
    news_briefing: str
    industry_briefing: str
    company_briefing: str
    references: List[str]
    briefings: Dict[str, Any]
    report: str
    # Brand DNA specific data
    brand_documents_data: Dict[str, Any]
    brand_analysis_context: Dict[str, Any]
