import logging
from logging.config import fileConfig
import os
import sys

# --- Alembic Config and Logging Setup ---
from alembic import context

config = context.config 
if config.config_file_name is not None:
    fileConfig(config.config_file_name) 
logger = logging.getLogger('alembic.env') 

# --- Debugging Python Path and Working Directory ---
path_to_add = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, path_to_add)
logger.info(f"migrations/env.py __file__: {__file__}")
logger.info(f"Calculated path added to sys.path: {path_to_add}")
logger.info(f"Current sys.path: {sys.path}")
logger.info(f"Current working directory (os.getcwd()): {os.getcwd()}")

# For further debugging the import path:
try:
    logger.info(f"Contents of /app (WORKDIR): {os.listdir('/app')}")
    if os.path.exists('/app/app'):
        logger.info(f"Contents of /app/app (expected Flask package dir): {os.listdir('/app/app')}")
    else:
        logger.warning("Directory /app/app (expected Flask package) does NOT exist!")
except Exception as e:
    logger.error(f"Error listing directories for debugging: {e}")

# --- Force Getting DATABASE_URL Directly from Environment ---
DATABASE_URL_FROM_ENV = os.environ.get('DATABASE_URL')
logger.info(f"Raw value of DATABASE_URL from os.environ.get: {DATABASE_URL_FROM_ENV}")

if not DATABASE_URL_FROM_ENV:
    error_msg = (
        "CRITICAL: DATABASE_URL environment variable was NOT FOUND by os.environ.get('DATABASE_URL') "
        "in migrations/env.py. Check .env file and docker-compose.yml environment passing for the 'backend' service."
    )
    logger.error(error_msg)
    raise ValueError(error_msg)

# Log the database URL being used (masking password)
try:
    from sqlalchemy.engine.url import make_url
    parsed_url = make_url(DATABASE_URL_FROM_ENV)
    password_to_mask = os.environ.get('POSTGRES_PASSWORD', ' DUMMY_PASSWORD_FOR_LOGGING ') 

    if password_to_mask is None: password_to_mask = ' DUMMY_PASSWORD_FOR_LOGGING '

    logged_url = str(parsed_url)
    if parsed_url.password: # Check if password exists in parsed_url
        logged_url = logged_url.replace(parsed_url.password, '********', 1)
    elif password_to_mask.strip(): # Check if password_to_mask is not empty
        logged_url = logged_url.replace(password_to_mask, '********', 1)

except Exception as e:
    logger.warning(f"Could not parse DATABASE_URL to hide password for logging: {e}. Logging potentially sensitive URL.")
    logged_url = f"{DATABASE_URL_FROM_ENV} (Warning: Password might be visible)"
logger.info(f"Alembic migrations will use database URL: {logged_url}")

config.set_main_option('sqlalchemy.url', DATABASE_URL_FROM_ENV)

# --- Import models and db for target_metadata ---
try:
    from app.database import db as target_db 
    import app.models 
    target_metadata = target_db.metadata
    logger.info("Successfully imported app.database and app.models.")
except ImportError as e:
    logger.error(f"Failed to import app.database or app.models. ModuleNotFoundError: {e}")
    raise e
except Exception as e:
    logger.error(f"An unexpected error occurred during import of app.database or app.models: {e}")
    raise e
# --- END METADATA SETUP ---

def get_metadata():
    return target_metadata

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=get_metadata(),
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    def process_revision_directives(context, revision, directives):
        if getattr(config.cmd_opts, 'autogenerate', False):
            script = directives[0]
            if script.upgrade_ops.is_empty():
                directives[:] = []
                logger.info('No changes in schema detected for autogenerate.')

    effective_configure_args = {"process_revision_directives": process_revision_directives}
    try:
        from app import create_app 
        flask_app_for_args = create_app()
        with flask_app_for_args.app_context():
            from flask import current_app
            if 'migrate' in current_app.extensions:
                base_args = current_app.extensions['migrate'].configure_args
                # Ensure our process_revision_directives is included if not already set
                if base_args.get("process_revision_directives") is None:
                     base_args["process_revision_directives"] = process_revision_directives
                effective_configure_args = base_args
                logger.info("Successfully retrieved configure_args from Flask-Migrate extension.")
            else:
                 logger.warning("Flask-Migrate extension ('migrate') not found in current_app.extensions for configure_args.")
    except ImportError as e:
        logger.warning(f"ImportError while trying to get configure_args (app or create_app not found): {e}. Using default process_revision_directives.")
    except Exception as e:
        logger.warning(f"Could not get configure_args from Flask-Migrate: {e}. Using default process_revision_directives.")

    from sqlalchemy import engine_from_config, pool
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}), # Uses [alembic] section from alembic.ini
        prefix="sqlalchemy.", # Will use the sqlalchemy.url we set via config.set_main_option
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=get_metadata(),
            **effective_configure_args
        )
        with context.begin_transaction():
            context.run_migrations()

# --- Main Execution ---
if context.is_offline_mode():
    logger.info("Running migrations in offline mode.")
    run_migrations_offline()
else:
    logger.info("Running migrations in online mode.")
    run_migrations_online()