from typing import Dict, Any, Union, List
import os
import logging
from ..classes import ResearchState
import asyncio
from ..utils.openrouter_client import OpenRouterClient

logger = logging.getLogger(__name__)

class Briefing:
    """Creates briefings for each research category and updates the ResearchState."""
    
    def __init__(self) -> None:
        self.max_doc_length = 8000  # Maximum document content length
        self.openrouter_key = os.getenv("OPENROUTER_API_KEY")
        if not self.openrouter_key:
            raise ValueError("OPENROUTER_API_KEY environment variable is not set")
        
        # Configure OpenRouter client
        self.openrouter_client = OpenRouterClient(api_key=self.openrouter_key)
        # Use Gemini model through OpenRouter
        self.gemini_model_id = "google/gemini-flash-1.5"  # OpenRouter model ID for Gemini

    def get_brand_dna_prompts(self, company: str, industry: str, hq_location: str) -> Dict[str, str]:
        """Get Brand DNA specific prompts"""
        return {
            'company': f"""Create a comprehensive Brand DNA analysis for {company}.
            
Analyze both uploaded brand documents and external research to create:

### Brand Foundation
* Core brand values and principles
* Mission and vision statements
* Brand purpose and why the company exists

### Brand Identity
* Brand personality traits and characteristics
* Brand voice and tone guidelines
* Visual identity elements (colors, fonts, logos)

### Brand Positioning
* Unique value proposition
* Target audience definition
* Competitive differentiation

### Brand Expression
* Key messaging frameworks
* Content themes and topics
* Communication style and approach

### Brand Culture
* Internal brand adoption
* Employee brand advocacy
* Cultural alignment with brand values

Focus on insights from uploaded brand documents when available.
Each bullet must be specific and actionable.
Never mention "no information found" or "no data available".
Provide only the briefing. No explanations or commentary.""",

            'industry': f"""Create a Brand Positioning Analysis for {company} in the {industry} industry.

### Industry Brand Landscape
* Key brand players and their positioning
* Industry brand standards and expectations
* Emerging brand trends in {industry}

### Competitive Brand Analysis
* Direct brand competitors and their strategies
* Brand differentiation opportunities
* Market gaps in brand positioning

### Brand Opportunities
* Untapped brand positioning opportunities
* Industry-specific brand challenges to address
* Potential brand partnership opportunities

Focus on brand-specific insights rather than general market data.
Each bullet must be specific and actionable.
Never mention "no information found" or "no data available".
Provide only the briefing. No explanations or commentary.""",

            'financial': f"""Create a Brand Investment Analysis for {company}.

### Brand Investment
* Marketing and advertising spend
* Brand development investments
* Brand asset valuations

### Brand Performance
* Brand recognition metrics
* Customer acquisition costs
* Brand loyalty indicators

### Brand ROI
* Marketing campaign performance
* Brand-driven revenue attribution
* Customer lifetime value by brand engagement

Focus on financial aspects related to brand building and performance.
Include specific numbers when possible.
Never mention "no information found" or "no data available".
Provide only the briefing. No explanations or commentary.""",

            'news': f"""Create a Brand Reputation Analysis for {company}.

### Brand Campaigns
* Recent marketing campaigns and initiatives
* Brand messaging evolution
* Creative campaign performance

### Brand Recognition
* Awards and industry recognition
* Media coverage and brand mentions
* Thought leadership and brand authority

### Brand Perception
* Public sentiment and brand reputation
* Customer feedback and testimonials
* Brand crisis management and responses

Sort newest to oldest.
Focus on brand-related news and developments.
Never mention "no information found" or "no data available".
Provide only the briefing. No explanations or commentary.""",
        }

    def get_original_prompts(self, company: str, industry: str, hq_location: str) -> Dict[str, str]:
        """Get original company research prompts"""
        return {
            'company': f"""Create a focused company briefing for {company}, a {industry} company based in {hq_location}.
Key requirements:
1. Start with: "{company} is a [what] that [does what] for [whom]"
2. Structure using these exact headers and bullet points:

### Core Product/Service
* List distinct products/features
* Include only verified technical capabilities

### Leadership Team
* List key leadership team members
* Include their roles and expertise

### Target Market
* List specific target audiences
* List verified use cases
* List confirmed customers/partners

### Key Differentiators
* List unique features
* List proven advantages

### Business Model
* Discuss product / service pricing
* List distribution channels

3. Each bullet must be a single, complete fact
4. Never mention "no information found" or "no data available"
5. No paragraphs, only bullet points
6. Provide only the briefing. No explanations or commentary.""",

            'industry': f"""Create a focused industry briefing for {company}, a {industry} company based in {hq_location}.
Key requirements:
1. Structure using these exact headers and bullet points:

### Market Overview
* State {company}'s exact market segment
* List market size with year
* List growth rate with year range

### Direct Competition
* List named direct competitors
* List specific competing products
* List market positions

### Competitive Advantages
• List unique technical features
• List proven advantages

### Market Challenges
• List specific verified challenges

2. Each bullet must be a single, complete news event.
3. No paragraphs, only bullet points
4. Never mention "no information found" or "no data available"
5. Provide only the briefing. No explanation.""",

            'financial': f"""Create a focused financial briefing for {company}, a {industry} company based in {hq_location}.
Key requirements:
1. Structure using these headers and bullet points:

### Funding & Investment
* Total funding amount with date
* List each funding round with date
* List named investors

### Revenue Model
* Discuss product / service pricing if applicable

2. Include specific numbers when possible
3. No paragraphs, only bullet points
4. Never mention "no information found" or "no data available"
5. NEVER repeat the same round of funding multiple times. ALWAYS assume that multiple funding rounds in the same month are the same round.
6. NEVER include a range of funding amounts. Use your best judgement to determine the exact amount based on the information provided.
6. Provide only the briefing. No explanation or commentary.""",

            'news': f"""Create a focused news briefing for {company}, a {industry} company based in {hq_location}.
Key requirements:
1. Structure into these categories using bullet points:

### Major Announcements
* Product / service launches
* New initiatives

### Partnerships
* Integrations
* Collaborations

### Recognition
* Awards
* Press coverage

2. Sort newest to oldest
3. One event per bullet point
4. Do not mention "no information found" or "no data available"
5. Never use ### headers, only bullet points
6. Provide only the briefing. Do not provide explanations or commentary.""",
        }

    async def generate_category_briefing(
        self, docs: Union[Dict[str, Any], List[Dict[str, Any]]], 
        category: str, context: Dict[str, Any]
    ) -> Dict[str, Any]:
        company = context.get('company', 'Unknown')
        industry = context.get('industry', 'Unknown')
        hq_location = context.get('hq_location', 'Unknown')
        analysis_type = context.get('analysis_type', 'company_research')
        
        logger.info(f"Generating {category} briefing for {company} using {len(docs)} documents (Analysis: {analysis_type})")

        # Send category start status
        if websocket_manager := context.get('websocket_manager'):
            if job_id := context.get('job_id'):
                await websocket_manager.send_status_update(
                    job_id=job_id,
                    status="briefing_start",
                    message=f"Generating {category} briefing",
                    result={
                        "step": "Briefing",
                        "category": category,
                        "total_docs": len(docs),
                        "analysis_type": analysis_type
                    }
                )

        # Choose prompts based on analysis type
        if analysis_type == 'brand_dna':
            prompts = self.get_brand_dna_prompts(company, industry, hq_location)
        else:
            prompts = self.get_original_prompts(company, industry, hq_location)
        
        # Normalize docs to a list of (url, doc) tuples
        items = list(docs.items()) if isinstance(docs, dict) else [
            (doc.get('url', f'doc_{i}'), doc) for i, doc in enumerate(docs)
        ]
        
        # Sort documents by evaluation score (highest first), but prioritize uploaded documents
        def sort_key(item):
            _, doc = item
            source_type = doc.get('source_type', 'external_search')
            score = float(doc.get('evaluation', {}).get('overall_score', '0'))
            
            # Prioritize uploaded documents
            if source_type == 'uploaded_document':
                return (2, score)  # Highest priority
            elif source_type == 'website_scrape':
                return (1, score)  # Medium priority
            else:
                return (0, score)  # Lowest priority
        
        sorted_items = sorted(items, key=sort_key, reverse=True)
        
        doc_texts = []
        total_length = 0
        uploaded_doc_count = 0
        
        for _, doc in sorted_items:
            title = doc.get('title', '')
            content = doc.get('raw_content') or doc.get('content', '')
            source_type = doc.get('source_type', 'external_search')
            
            if len(content) > self.max_doc_length:
                content = content[:self.max_doc_length] + "... [content truncated]"
            
            # Add source type indicator
            source_indicator = ""
            if source_type == 'uploaded_document':
                source_indicator = "[UPLOADED BRAND DOCUMENT] "
                uploaded_doc_count += 1
            elif source_type == 'website_scrape':
                source_indicator = "[COMPANY WEBSITE] "
            
            doc_entry = f"{source_indicator}Title: {title}\n\nContent: {content}"
            
            if total_length + len(doc_entry) < 120000:  # Keep under limit
                doc_texts.append(doc_entry)
                total_length += len(doc_entry)
            else:
                break
        
        separator = "\n" + "-" * 40 + "\n"
        
        # Add special instruction for brand DNA analysis with uploaded documents
        analysis_instruction = ""
        if analysis_type == 'brand_dna' and uploaded_doc_count > 0:
            analysis_instruction = f"\n\nIMPORTANT: This analysis includes {uploaded_doc_count} uploaded brand documents marked with [UPLOADED BRAND DOCUMENT]. Prioritize insights from these internal brand assets as they represent the organization's official brand materials.\n"
        
        prompt = f"""{prompts.get(category, 'Create a focused, informative and insightful research briefing on the company: {company} in the {industry} industry based on the provided documents.')}{analysis_instruction}

Analyze the following documents and extract key information. Provide only the briefing, no explanations or commentary:

{separator}{separator.join(doc_texts)}{separator}

"""
        
        try:
            logger.info(f"Sending prompt to LLM (uploaded docs: {uploaded_doc_count})")
            response = await self.openrouter_client.generate_content(prompt, model=self.gemini_model_id)
            content = response.text.strip()
            if not content:
                logger.error(f"Empty response from LLM for {category} briefing")
                return {'content': ''}

            # Send completion status
            if websocket_manager := context.get('websocket_manager'):
                if job_id := context.get('job_id'):
                    await websocket_manager.send_status_update(
                        job_id=job_id,
                        status="briefing_complete",
                        message=f"Completed {category} briefing",
                        result={
                            "step": "Briefing",
                            "category": category,
                            "uploaded_docs_used": uploaded_doc_count
                        }
                    )

            return {'content': content}
        except Exception as e:
            logger.error(f"Error generating {category} briefing: {e}")
            return {'content': ''}

    async def create_briefings(self, state: ResearchState) -> ResearchState:
        """Create briefings for all categories in parallel."""
        company = state.get('company', 'Unknown Company')
        websocket_manager = state.get('websocket_manager')
        job_id = state.get('job_id')
        analysis_type = state.get('analysis_type', 'company_research')
        
        # Send initial briefing status
        if websocket_manager and job_id:
            await websocket_manager.send_status_update(
                job_id=job_id,
                status="processing",
                message=f"Starting {analysis_type} briefings",
                result={"step": "Briefing", "analysis_type": analysis_type}
            )

        context = {
            "company": company,
            "industry": state.get('industry', 'Unknown'),
            "hq_location": state.get('hq_location', 'Unknown'),
            "analysis_type": analysis_type,
            "websocket_manager": websocket_manager,
            "job_id": job_id
        }
        logger.info(f"Creating section briefings for {company} (Analysis: {analysis_type})")
        
        # Mapping of curated data fields to briefing categories
        categories = {
            'financial_data': ("financial", "financial_briefing"),
            'news_data': ("news", "news_briefing"),
            'industry_data': ("industry", "industry_briefing"),
            'company_data': ("company", "company_briefing")
        }
        
        briefings = {}

        # Create tasks for parallel processing
        briefing_tasks = []
        for data_field, (cat, briefing_key) in categories.items():
            curated_key = f'curated_{data_field}'
            curated_data = state.get(curated_key, {})
            
            if curated_data:
                logger.info(f"Processing {data_field} with {len(curated_data)} documents")
                
                # Create task for this category
                briefing_tasks.append({
                    'category': cat,
                    'briefing_key': briefing_key,
                    'data_field': data_field,
                    'curated_data': curated_data
                })
            else:
                logger.info(f"No data available for {data_field}")
                state[briefing_key] = ""

        # Process briefings in parallel with rate limiting
        if briefing_tasks:
            # Rate limiting semaphore for LLM API
            briefing_semaphore = asyncio.Semaphore(2)  # Limit to 2 concurrent briefings
            
            async def process_briefing(task: Dict[str, Any]) -> Dict[str, Any]:
                """Process a single briefing with rate limiting."""
                async with briefing_semaphore:
                    result = await self.generate_category_briefing(
                        task['curated_data'],
                        task['category'],
                        context
                    )
                    
                    if result['content']:
                        briefings[task['category']] = result['content']
                        state[task['briefing_key']] = result['content']
                        logger.info(f"Completed {task['data_field']} briefing ({len(result['content'])} characters)")
                    else:
                        logger.error(f"Failed to generate briefing for {task['data_field']}")
                        state[task['briefing_key']] = ""
                    
                    return {
                        'category': task['category'],
                        'success': bool(result['content']),
                        'length': len(result['content']) if result['content'] else 0
                    }

            # Process all briefings in parallel
            results = await asyncio.gather(*[
                process_briefing(task) 
                for task in briefing_tasks
            ])
            
            # Log completion statistics
            successful_briefings = sum(1 for r in results if r['success'])
            total_length = sum(r['length'] for r in results)
            logger.info(f"Generated {successful_briefings}/{len(briefing_tasks)} briefings with total length {total_length}")

        state['briefings'] = briefings
        return state

    async def run(self, state: ResearchState) -> ResearchState:
        return await self.create_briefings(state)
