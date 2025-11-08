"""
Federated Learning Service - Model aggregation and coordination
"""
import numpy as np
import json
import hashlib
import base64
import pickle
from typing import List, Dict
from app.db.models import Contribution, TrainingSession
from app.core.security import EncryptionService, CommitmentHash

class FederatedLearningService:
    """Handle federated learning operations"""
    
    def __init__(self):
        self.encryption_service = EncryptionService()
    
    async def aggregate_gradients(
        self,
        contributions: List[Contribution],
        session: TrainingSession
    ) -> Dict:
        """
        Aggregate gradients from multiple contributors using Federated Averaging
        """
        if not contributions:
            raise ValueError("No contributions to aggregate")
        
        # Decrypt and deserialize gradients
        gradients_list = []
        weights = []
        
        for contribution in contributions:
            try:
                # Verify commitment hash
                encrypted_grads = base64.b64decode(contribution.encrypted_gradients)
                decrypted = self.encryption_service.decrypt_gradients(encrypted_grads)
                
                # Verify commitment
                commitment, nonce_bytes = CommitmentHash.generate_commitment(
                    decrypted,
                    base64.b64decode(contribution.nonce)
                )
                
                if commitment != contribution.commitment_hash:
                    print(f"Commitment verification failed for {contribution.contributor_address}")
                    continue
                
                # Filter by accuracy threshold
                if contribution.accuracy < session.accuracy_threshold:
                    print(f"Accuracy below threshold for {contribution.contributor_address}")
                    continue
                
                gradients_list.append(decrypted)
                # Weight by accuracy and privacy score
                weight = contribution.accuracy * contribution.privacy_score
                weights.append(weight)
                
            except Exception as e:
                print(f"Error processing contribution {contribution.id}: {e}")
                continue
        
        if not gradients_list:
            raise ValueError("No valid contributions after filtering")
        
        # Normalize weights
        weights = np.array(weights)
        weights = weights / weights.sum()
        
        # Federated Averaging
        aggregated_gradients = self._federated_average(gradients_list, weights)
        
        # Calculate aggregated accuracy
        accuracies = [c.accuracy for c in contributions if c.accuracy >= session.accuracy_threshold]
        aggregated_accuracy = np.mean(accuracies) if accuracies else 0.0
        
        # Create model hash
        model_str = json.dumps([g.tolist() if isinstance(g, np.ndarray) else str(g) for g in aggregated_gradients])
        model_hash = hashlib.sha256(model_str.encode()).hexdigest()
        
        # Mark contributions as aggregated
        for contribution in contributions:
            if contribution.accuracy >= session.accuracy_threshold:
                contribution.status = "aggregated"
        
        return {
            "model_hash": model_hash,
            "accuracy": float(aggregated_accuracy),
            "contributors_count": len(gradients_list),
            "aggregated_gradients": aggregated_gradients
        }
    
    def _federated_average(
        self,
        gradients_list: List[List[np.ndarray]],
        weights: np.ndarray
    ) -> List[np.ndarray]:
        """Perform weighted federated averaging"""
        if not gradients_list:
            raise ValueError("Empty gradients list")
        
        # Initialize aggregated gradients
        num_layers = len(gradients_list[0])
        aggregated = [np.zeros_like(grad) for grad in gradients_list[0]]
        
        # Weighted average
        for idx, gradients in enumerate(gradients_list):
            weight = weights[idx]
            for layer_idx, grad in enumerate(gradients):
                aggregated[layer_idx] += weight * grad
        
        return aggregated
    
    def validate_gradients(
        self,
        gradients: List[np.ndarray],
        commitment_hash: str,
        nonce: str
    ) -> bool:
        """Validate gradients using commitment hash"""
        try:
            nonce_bytes = base64.b64decode(nonce)
            commitment, _ = CommitmentHash.generate_commitment(gradients, nonce_bytes)
            return commitment == commitment_hash
        except Exception as e:
            print(f"Validation error: {e}")
            return False
    
    def calculate_model_accuracy(
        self,
        model_weights: List[np.ndarray],
        test_data: np.ndarray,
        test_labels: np.ndarray
    ) -> float:
        """Calculate model accuracy (placeholder - implement with actual model)"""
        # This would typically use a ML framework like PyTorch or TensorFlow
        # For now, return a mock accuracy
        return 0.85

