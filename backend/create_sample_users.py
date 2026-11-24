import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mi_rates_backend.settings')
django.setup()

from django.contrib.auth.models import User

users_data = [
    {
        'username': 'admin',
        'email': 'admin@sltmobitel.lk',
        'password': 'Admin@123',
        'first_name': 'SLT',
        'last_name': 'Admin',
        'is_staff': True,
        'is_superuser': True,
    },
    {
        'username': 'slt_admin',
        'email': 'admin.enterprise@sltmobitel.lk',
        'password': 'Admin@123',
        'first_name': 'SLTMobitel',
        'last_name': 'Enterprise Admin',
        'is_staff': True,
        'is_superuser': True,
    },
    {
        'username': 'anushka',
        'email': 'anushka@sltmobitel.lk',
        'password': 'Intern@123',
        'first_name': 'Anushka',
        'last_name': 'Dilshan',
        'is_staff': False,
        'is_superuser': False,
    },
    {
        'username': 'anushka_intern',
        'email': 'anushka.intern@sltmobitel.lk',
        'password': 'Intern@123',
        'first_name': 'Anushka',
        'last_name': 'Dilshan',
        'is_staff': False,
        'is_superuser': False,
    },
    {
        'username': 'commercial_manager',
        'email': 'manager.commercial@sltmobitel.lk',
        'password': 'Manager@123',
        'first_name': 'Commercial',
        'last_name': 'Manager',
        'is_staff': False,
        'is_superuser': False,
    },
]

print("Adding sample users into Oracle Database table auth_user...")
for item in users_data:
    user, created = User.objects.get_or_create(username=item['username'])
    user.email = item['email']
    user.first_name = item['first_name']
    user.last_name = item['last_name']
    user.is_staff = item['is_staff']
    user.is_superuser = item['is_superuser']
    user.set_password(item['password'])
    user.save()

    action = "Created new" if created else "Updated existing"
    print(f" {action} user: {user.username} | Email: {user.email} | Password: {item['password']} | Admin: {user.is_staff}")

print(f"\nTotal users in Oracle Database: {User.objects.count()}")
