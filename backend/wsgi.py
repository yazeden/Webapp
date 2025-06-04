import sys
import os

current_dir = os.path.abspath(os.path.dirname(__file__))


if current_dir not in sys.path:
    sys.path.insert(0, current_dir)


from app import create_app, db
from app.models import User, Greenhouse, AuthToken, Plant, Sensor, SensorData, Unit, Actuator, ActuatorLog

from flask_migrate import Migrate


app = create_app()
migrate = Migrate(app, db) # Initialize Migrate here


@app.shell_context_processor
def make_shell_context():
    return dict(
        db=db,
        User=User,
        Greenhouse=Greenhouse,
        AuthToken=AuthToken,
        Plant=Plant,
        Sensor=Sensor,
        SensorData=SensorData,
        Unit=Unit,
        Actuator=Actuator,
        ActuatorLog=ActuatorLog
    )

if __name__ == '__main__':
    app.run(debug=True, port=5000)