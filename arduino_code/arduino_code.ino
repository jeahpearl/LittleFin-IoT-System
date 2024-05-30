#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// Data wire is plugged into digital pin 2 on the Arduino
#define ONE_WIRE_BUS 2

// Setup a oneWire instance to communicate with any OneWire device
OneWire oneWire(ONE_WIRE_BUS);

// Pass oneWire reference to DallasTemperature library
DallasTemperature sensors(&oneWire);

const char* ssid = "Infinix NOTE 40 Pro+ 5G";           // Replace with your WiFi SSID
const char* password = "kepler46";   // Replace with your WiFi password
const char* serverUrl = "http://192.168.118.225:8000/add"; // Change to your server's IP address

WiFiClient client;
HTTPClient http;

void setup(void) {
  Serial.begin(9600);
  WiFi.begin(ssid, password);

  // Wait for connection
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("Connected to WiFi");
  sensors.begin();
}

void loop(void) {
  // Send the command to get temperatures
  sensors.requestTemperatures();

  // Read temperature in Celsius
  float tempC = sensors.getTempCByIndex(0);
  float tempF = tempC * 9.0 / 5.0 + 32.0; // Convert to Fahrenheit
  
  if (WiFi.status() == WL_CONNECTED) {
    http.begin(client, serverUrl); //Specify request destination
    http.addHeader("Content-Type", "application/json");
    
    String postData = "{\"tank_name\":\"Little Fin\",\"temperature\":" + String(tempC, 2) + ",\"fahrenheit\":" + String(tempF, 2) + "}";
    Serial.print("Sending data: ");
    Serial.println(postData);

    int httpResponseCode = http.POST(postData);
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);

    http.end(); //Free resources
  }

  // Debug output
  Serial.print("Temperature: ");
  Serial.print(tempC);
  Serial.print((char)176);
  Serial.print("C | ");
  Serial.print(tempF);
  Serial.print((char)176);
  Serial.println("F");
  
  delay(10000); // Delay before next reading
}
