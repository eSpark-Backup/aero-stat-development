export const PHASE_2_DATA = {
    method: "alfa.server.connection.settings.set",
    servers: [
      {
        modbus: [
          {
            name: "modbus1",
            ip: "10.85.5.13",
            ports: [
              { port: "5001", name: "hull_pressure" },
              { port: "5002", name: "ballonet_pressure" },
              { port: "5003", name: "ahrs" },
              { port: "5004", name: "ultrasonic" },
              { port: "5005", name: "load_cell" },
              { port: "5006", name: "temp_humidity" },
              { port: "5007", name: "weather_station" }
            ]
          },
          {
            name: "modbus-relay",
            ip: "10.85.5.12",
            ports: [{ port: "4196", name: "relay" }]
          }
        ]
      }
    ]
  };
  