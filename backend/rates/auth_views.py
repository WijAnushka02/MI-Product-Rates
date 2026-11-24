import secrets
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    Registers a new user in the system.
    Payload: { "username": "...", "email": "...", "password": "...", "full_name": "..." }
    """
    username = request.data.get('username', '').strip()
    email = request.data.get('email', '').strip().lower()
    password = request.data.get('password', '')
    full_name = request.data.get('full_name', '').strip()

    if not username:
        return Response({'error': 'Username is required.'}, status=status.HTTP_400_BAD_REQUEST)
    if not password or len(password) < 6:
        return Response({'error': 'Password must be at least 6 characters long.'}, status=status.HTTP_400_BAD_REQUEST)
    if not email:
        return Response({'error': 'Email address is required.'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username__iexact=username).exists():
        return Response({'error': 'A user with this username already exists.'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email__iexact=email).exists():
        return Response({'error': 'A user with this email already exists.'}, status=status.HTTP_400_BAD_REQUEST)

    first_name = full_name.split(' ')[0] if full_name else username
    last_name = ' '.join(full_name.split(' ')[1:]) if full_name and ' ' in full_name else ''

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name
    )

    login(request, user)

    return Response({
        'message': 'Registration successful.',
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'full_name': f"{user.first_name} {user.last_name}".strip() or user.username,
            'role': 'Enterprise Administrator' if user.is_staff else 'Rate Executive'
        }
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """
    Logs in an existing user with username/email and password.
    Payload: { "username": "...", "password": "..." }
    """
    username_or_email = request.data.get('username', '').strip()
    password = request.data.get('password', '')

    if not username_or_email or not password:
        return Response({'error': 'Username/Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

    # Allow login with either username or email
    user = authenticate(request, username=username_or_email, password=password)
    if user is None and '@' in username_or_email:
        try:
            matched_user = User.objects.get(email__iexact=username_or_email)
            user = authenticate(request, username=matched_user.username, password=password)
        except (User.DoesNotExist, User.MultipleObjectsReturned):
            user = None

    if user is None:
        return Response({'error': 'Invalid credentials. Please verify your username and password.'}, status=status.HTTP_401_UNAUTHORIZED)

    if not user.is_active:
        return Response({'error': 'This account has been deactivated.'}, status=status.HTTP_403_FORBIDDEN)

    login(request, user)

    return Response({
        'message': 'Login successful.',
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'full_name': f"{user.first_name} {user.last_name}".strip() or user.username,
            'role': 'Enterprise Administrator' if user.is_staff else 'Rate Executive'
        }
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth(request):
    """
    Optional Google OAuth2 Authentication handler.
    Receives Google authenticated profile/token and signs in or registers the user.
    Payload: { "email": "...", "name": "...", "google_id": "...", "picture": "..." }
    """
    email = request.data.get('email', '').strip().lower()
    name = request.data.get('name', '').strip()
    picture = request.data.get('picture', '')

    if not email:
        return Response({'error': 'Google account email is required.'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.filter(email__iexact=email).first()

    if not user:
        # Auto-create user from Google OAuth profile
        base_username = email.split('@')[0]
        username = base_username
        counter = 1
        while User.objects.filter(username__iexact=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        first_name = name.split(' ')[0] if name else username
        last_name = ' '.join(name.split(' ')[1:]) if name and ' ' in name else ''

        user = User.objects.create_user(
            username=username,
            email=email,
            password=secrets.token_urlsafe(16),
            first_name=first_name,
            last_name=last_name
        )

    login(request, user)

    return Response({
        'message': 'Google authentication successful.',
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'full_name': f"{user.first_name} {user.last_name}".strip() or user.username,
            'picture': picture,
            'role': 'Enterprise Administrator' if user.is_staff else 'Rate Executive',
            'auth_provider': 'google'
        }
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_current_user(request):
    """
    Returns the currently logged in user profile.
    """
    if request.user.is_authenticated:
        return Response({
            'authenticated': True,
            'user': {
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                'full_name': f"{request.user.first_name} {request.user.last_name}".strip() or request.user.username,
                'role': 'Enterprise Administrator' if request.user.is_staff else 'Rate Executive'
            }
        })
    return Response({'authenticated': False, 'user': None})


@api_view(['POST'])
def logout_user(request):
    """
    Terminates the user session.
    """
    logout(request)
    return Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)
