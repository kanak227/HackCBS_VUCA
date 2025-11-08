"""
Security utilities for encryption and privacy
"""
import numpy as np
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.backends import default_backend
import base64
import os
from typing import List, Tuple

class EncryptionService:
    """Handle encryption/decryption of gradients"""
    
    def __init__(self, key: bytes = None):
        if key is None:
            key = Fernet.generate_key()
        self.cipher = Fernet(key)
        self.key = key
    
    def encrypt_gradients(self, gradients: List[np.ndarray]) -> bytes:
        """Encrypt gradients before transmission"""
        # Serialize gradients to bytes
        import pickle
        serialized = pickle.dumps(gradients)
        return self.cipher.encrypt(serialized)
    
    def decrypt_gradients(self, encrypted: bytes) -> List[np.ndarray]:
        """Decrypt gradients after reception"""
        import pickle
        decrypted = self.cipher.decrypt(encrypted)
        return pickle.loads(decrypted)
    
    def get_key_base64(self) -> str:
        """Get encryption key as base64 string"""
        return base64.b64encode(self.key).decode()

class LocalDifferentialPrivacy:
    """Apply Local Differential Privacy to gradients"""
    
    def __init__(self, epsilon: float = 1.0, sensitivity: float = 1.0):
        self.epsilon = epsilon
        self.sensitivity = sensitivity
    
    def add_laplace_noise(self, gradients: List[np.ndarray]) -> List[np.ndarray]:
        """Add Laplace noise to gradients for LDP"""
        noisy_gradients = []
        scale = self.sensitivity / self.epsilon
        
        for grad in gradients:
            # Generate Laplace noise
            noise = np.random.laplace(0, scale, grad.shape)
            noisy_grad = grad + noise
            noisy_gradients.append(noisy_grad)
        
        return noisy_gradients
    
    def add_gaussian_noise(self, gradients: List[np.ndarray], delta: float = 1e-5) -> List[np.ndarray]:
        """Add Gaussian noise for (epsilon, delta)-DP"""
        noisy_gradients = []
        sigma = np.sqrt(2 * np.log(1.25 / delta)) * self.sensitivity / self.epsilon
        
        for grad in gradients:
            noise = np.random.normal(0, sigma, grad.shape)
            noisy_grad = grad + noise
            noisy_gradients.append(noisy_grad)
        
        return noisy_gradients

class CommitmentHash:
    """Generate commitment hashes for gradient integrity verification"""
    
    @staticmethod
    def generate_commitment(gradients: List[np.ndarray], nonce: bytes = None) -> str:
        """Generate commitment hash for gradients"""
        import pickle
        import hashlib
        
        if nonce is None:
            nonce = os.urandom(32)
        
        # Serialize gradients
        serialized = pickle.dumps(gradients)
        
        # Create hash
        hash_obj = hashlib.sha256(serialized + nonce)
        commitment = hash_obj.hexdigest()
        
        return commitment, nonce
    
    @staticmethod
    def verify_commitment(gradients: List[np.ndarray], commitment: str, nonce: bytes) -> bool:
        """Verify commitment hash"""
        new_commitment, _ = CommitmentHash.generate_commitment(gradients, nonce)
        return new_commitment == commitment

