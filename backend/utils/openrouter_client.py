import os
import logging
from openai import AsyncOpenAI
from typing import Dict, List, Any, Optional

logger = logging.getLogger(__name__)

class OpenRouterClient:
    """
    A client for interacting with the OpenRouter API using the openai library interface.
    This class provides methods for generating text completions.
    """

    def __init__(self, api_key=None, site_url=None, site_name=None):
        """
        Initialize the OpenRouter client using the OpenAI library pattern.

        Args:
            api_key: OpenRouter API key (optional, will use environment variable if not provided)
            site_url: Optional site URL for rankings on openrouter.ai.
            site_name: Optional site title for rankings on openrouter.ai.
        """
        self.api_key = api_key or os.getenv("OPENROUTER_API_KEY")
        if not self.api_key:
            logger.error(
                "No OpenRouter API key provided. Please set the OPENROUTER_API_KEY environment variable."
            )
            raise ValueError("OpenRouter API key is required.")

        self.extra_headers = {}
        if site_url:
            self.extra_headers["HTTP-Referer"] = site_url
        if site_name:
            self.extra_headers["X-Title"] = site_name

        # Initialize the OpenAI client pointed at OpenRouter
        self.client = AsyncOpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=self.api_key,
        )

    async def generate_completion(
        self,
        messages: List[Dict[str, str]],
        model: str = "openai/gpt-3.5-turbo",
        temperature: float = 0.7,
        max_tokens: int = 1000,
        stream: bool = False
    ):
        """
        Generate a text completion using OpenRouter via the OpenAI client interface.

        Args:
            messages: List of message dictionaries with 'role' and 'content' keys
            model: Model to use for completion (e.g., 'openai/gpt-4o', 'google/gemini-flash-1.5')
            temperature: Sampling temperature (0.0 to 1.0)
            max_tokens: Maximum number of tokens to generate
            stream: Whether to stream the response

        Returns:
            OpenAI response object
        """
        try:
            # Use the OpenAI client's chat completion method
            response = await self.client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=stream,
                extra_headers=self.extra_headers,  # Pass extra headers if provided
            )
            
            return response
        except Exception as e:
            logger.error(f"Error generating completion: {e}")
            raise

    async def generate_content(self, prompt: str, model: str = "google/gemini-flash-1.5"):
        """
        Generate content using a prompt string, mimicking Gemini's generate_content method.
        This is a compatibility wrapper for code that expects Gemini's API.

        Args:
            prompt: The prompt string
            model: Model to use for completion

        Returns:
            An object with a 'text' attribute containing the generated content
        """
        try:
            response = await self.generate_completion(
                messages=[{"role": "user", "content": prompt}],
                model=model,
                temperature=0,
                max_tokens=4096
            )
            
            # Create a response object that mimics Gemini's response format
            class GeminiStyleResponse:
                def __init__(self, text):
                    self.text = text
            
            return GeminiStyleResponse(response.choices[0].message.content)
        except Exception as e:
            logger.error(f"Error generating content: {e}")
            raise
