"""
Gemini API Service for Model Evaluation
"""
import google.generativeai as genai
import json
import logging
from typing import Dict, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

class GeminiService:
    """Handle Gemini API integration for model evaluation"""
    
    def __init__(self):
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.model = genai.GenerativeModel(settings.GEMINI_MODEL)
        else:
            logger.warning("Gemini API key not configured. Using mock evaluation.")
            self.model = None
    
    async def evaluate_model(
        self,
        challenge_id: str,
        model_hash: str,
        baseline_accuracy: float,
        model_metadata: Optional[Dict] = None
    ) -> Dict:
        """
        Evaluate a fine-tuned model using Gemini API
        Returns mock evaluation results if API key is not configured
        """
        try:
            if not self.model:
                # Return mock evaluation results
                return self._generate_mock_evaluation(baseline_accuracy, model_hash)
            
            # Prepare evaluation prompt
            prompt = self._build_evaluation_prompt(
                challenge_id,
                model_hash,
                baseline_accuracy,
                model_metadata
            )
            
            # Call Gemini API
            response = await self._call_gemini_api(prompt)
            
            # Parse response
            evaluation_result = self._parse_evaluation_response(response)
            
            return evaluation_result
            
        except Exception as e:
            logger.error(f"Error evaluating model with Gemini: {e}")
            # Fallback to mock evaluation
            return self._generate_mock_evaluation(baseline_accuracy, model_hash)
    
    def _build_evaluation_prompt(
        self,
        challenge_id: str,
        model_hash: str,
        baseline_accuracy: float,
        model_metadata: Optional[Dict] = None
    ) -> str:
        """Build prompt for Gemini API"""
        prompt = f"""
        Evaluate the following AI model submission for a fine-tuning challenge:
        
        Challenge ID: {challenge_id}
        Model Hash: {model_hash}
        Baseline Accuracy: {baseline_accuracy:.4f}
        
        Model Metadata: {json.dumps(model_metadata) if model_metadata else "Not provided"}
        
        Please provide an evaluation report with the following metrics:
        1. Accuracy (0.0 to 1.0)
        2. Precision (0.0 to 1.0)
        3. Recall (0.0 to 1.0)
        4. F1 Score (0.0 to 1.0)
        5. Loss value
        6. Overall assessment
        
        Return the response as a JSON object with the following structure:
        {{
            "accuracy": <float>,
            "precision": <float>,
            "recall": <float>,
            "f1_score": <float>,
            "loss": <float>,
            "report": "<detailed evaluation report>",
            "improvement_over_baseline": <float>
        }}
        """
        return prompt
    
    async def _call_gemini_api(self, prompt: str) -> str:
        """Call Gemini API asynchronously"""
        try:
            # For now, using synchronous call - can be made async with asyncio
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Error calling Gemini API: {e}")
            raise
    
    def _parse_evaluation_response(self, response: str) -> Dict:
        """Parse Gemini API response"""
        try:
            # Try to extract JSON from response
            # Gemini might return markdown or text with JSON
            if "```json" in response:
                json_start = response.find("```json") + 7
                json_end = response.find("```", json_start)
                json_str = response[json_start:json_end].strip()
            elif "```" in response:
                json_start = response.find("```") + 3
                json_end = response.find("```", json_start)
                json_str = response[json_start:json_end].strip()
            else:
                json_str = response.strip()
            
            # Try to find JSON object in response
            start_idx = json_str.find("{")
            end_idx = json_str.rfind("}") + 1
            if start_idx != -1 and end_idx > start_idx:
                json_str = json_str[start_idx:end_idx]
            
            result = json.loads(json_str)
            
            # Validate and format result
            return {
                "accuracy": float(result.get("accuracy", 0.0)),
                "precision": float(result.get("precision", 0.0)),
                "recall": float(result.get("recall", 0.0)),
                "f1_score": float(result.get("f1_score", 0.0)),
                "loss": float(result.get("loss", 0.0)),
                "report": result.get("report", "Evaluation completed"),
                "improvement_over_baseline": float(result.get("improvement_over_baseline", 0.0))
            }
            
        except json.JSONDecodeError as e:
            logger.warning(f"Failed to parse Gemini response as JSON: {e}")
            # Return default evaluation
            return self._generate_mock_evaluation(0.8, "")
        except Exception as e:
            logger.error(f"Error parsing evaluation response: {e}")
            return self._generate_mock_evaluation(0.8, "")
    
    def _generate_mock_evaluation(self, baseline_accuracy: float, model_hash: str) -> Dict:
        """Generate mock evaluation results for testing"""
        import random
        
        # Generate accuracy that's likely better than baseline (with some randomness)
        accuracy = baseline_accuracy + random.uniform(0.01, 0.15)
        accuracy = min(1.0, accuracy)  # Cap at 1.0
        
        precision = accuracy + random.uniform(-0.05, 0.05)
        precision = max(0.0, min(1.0, precision))
        
        recall = accuracy + random.uniform(-0.05, 0.05)
        recall = max(0.0, min(1.0, recall))
        
        f1_score = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0
        loss = 1.0 - accuracy + random.uniform(-0.1, 0.1)
        loss = max(0.0, loss)
        
        improvement = accuracy - baseline_accuracy
        
        return {
            "accuracy": round(accuracy, 4),
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "f1_score": round(f1_score, 4),
            "loss": round(loss, 4),
            "report": f"""
            Mock Evaluation Report for Model: {model_hash[:16]}...
            
            Accuracy: {accuracy:.4f} ({improvement:+.4f} improvement over baseline)
            Precision: {precision:.4f}
            Recall: {recall:.4f}
            F1 Score: {f1_score:.4f}
            Loss: {loss:.4f}
            
            This is a mock evaluation result generated for testing purposes.
            In production, this would be replaced with actual Gemini API evaluation.
            """,
            "improvement_over_baseline": round(improvement, 4)
        }

# Singleton instance
gemini_service = GeminiService()
