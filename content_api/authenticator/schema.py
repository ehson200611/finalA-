# your_app/schema.py
from drf_spectacular.extensions import OpenApiAuthenticationExtension

class JWTScheme(OpenApiAuthenticationExtension):
    target_class = 'rest_framework_simplejwt.authentication.JWTAuthentication'
    name = 'Bearer'
    
    def get_security_definition(self, auto_schema):
        return {
            'type': 'http',
            'scheme': 'bearer',
            'bearerFormat': 'JWT',
            'description': 'JWT Token Authorization'
        }