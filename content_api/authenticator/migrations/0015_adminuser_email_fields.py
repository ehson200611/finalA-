# Generated manually to add email and other fields to AdminUser

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authenticator', '0014_notificationadmin_code_alter_smscode_purpose'),
    ]

    operations = [
        migrations.AddField(
            model_name='adminuser',
            name='email',
            field=models.EmailField(blank=True, max_length=254, null=True),
        ),
        migrations.AddField(
            model_name='adminuser',
            name='avatar',
            field=models.ImageField(blank=True, null=True, upload_to='avatars/'),
        ),
        migrations.AddField(
            model_name='adminuser',
            name='last_login_ip',
            field=models.GenericIPAddressField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='adminuser',
            name='notes',
            field=models.TextField(blank=True, help_text='Заметки администратора'),
        ),
        migrations.AddField(
            model_name='adminuser',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
    ]

