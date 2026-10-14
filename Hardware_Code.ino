#include <Wire.h>
#include <SPI.h>
#include <MPU6050_light.h>
#include <TinyGPSPlus.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <MFRC522.h>

// 1. OLED Display Settings (128x64)
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET    -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// 2. RFID Pins (SPI)
#define RST_PIN 27
#define SS_PIN  5
MFRC522 rfc(SS_PIN, RST_PIN);

// 3. Sensors and Communication Objects
MPU6050 mpu(Wire);
TinyGPSPlus gps;
HardwareSerial gpsSerial(2); // GPS on UART2 (RX=16, TX=17)

unsigned long displayTimer = 0;
unsigned long serialTimer = 0;
unsigned long pageTimer = 0;
int displayPage = 0; // 0 = Motion, 1 = GPS Position, 2 = GPS Dynamics/Time, 3 = RFID
String lastRfidTag = "None";

void setup() {
  Serial.begin(115200);
  while (!Serial);
  Serial.println(F("\n--- Initializing Advanced Quad-System Telemetry ---"));

  // Initialize Communication Buses
  Wire.begin(21, 22);                        // I2C for MPU6050 & OLED
  gpsSerial.begin(9600, SERIAL_8N1, 16, 17); // UART for NEO-6M GPS
  SPI.begin();                               // SPI for RC522 RFID
  rfc.PCD_Init();                            // Initialize RFID Reader

  // Initialize OLED Display (Address 0x3C)
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("ERROR: SSD1306 allocation failed!"));
    while(1);
  }

  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println(F("Booting Advanced System..."));
  display.display();
  delay(1000);

  // Initialize MPU6050 Motion Sensor
  byte status = mpu.begin();
  Serial.print(F("MPU6050 Status: ")); Serial.println(status);
  if (status != 0) {
    display.clearDisplay();
    display.setCursor(0, 0);
    display.println(F("MPU6050 Error!"));
    display.display();
    while(1);
  }

  display.clearDisplay();
  display.setCursor(0, 0);
  display.println(F("Calibrating MPU..."));
  display.setCursor(0, 10);
  display.println(F("Keep sensor still!"));
  display.display();
  
  mpu.calcOffsets(true, true); // Automatic calibration
  Serial.println(F("MPU6050 Calibration Complete."));

  display.clearDisplay();
  display.setCursor(0, 0);
  display.println(F("All Systems Online!"));
  display.display();
  delay(1500);
}

void loop() {
  // 1. Continuously feed incoming GPS NMEA sentences into TinyGPS++
  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }

  // 2. Update MPU6050 motion calculations
  mpu.update();

  // 3. Check for incoming RFID tag scans
  if (rfc.PICC_IsNewCardPresent() && rfc.PICC_ReadCardSerial()) {
    lastRfidTag = "";
    for (byte i = 0; i < rfc.uid.size; i++) {
      lastRfidTag += String(rfc.uid.uidByte[i] < 0x10 ? "0" : "");
      lastRfidTag += String(rfc.uid.uidByte[i], HEX);
      if (i < rfc.uid.size - 1) lastRfidTag += " ";
    }
    lastRfidTag.toUpperCase();
    
    Serial.print(F("[RFID EVENT] Scanned Tag UID: ")); 
    Serial.println(lastRfidTag);
    
    rfc.PICC_HaltA();
    rfc.PCD_StopCrypto1();
  }

  // 4. Rotate OLED display pages every 3 seconds (0 to 3)
  if (millis() - pageTimer > 3000) {
    pageTimer = millis();
    displayPage = (displayPage + 1) % 4;
  }

  // 5. Refresh OLED Screen every 200ms
  if (millis() - displayTimer > 200) {
    displayTimer = millis();

    display.clearDisplay();
    display.setCursor(0, 0);
    display.setTextSize(1);

    if (displayPage == 0) {
      // --- PAGE 0: Motion Telemetry ---
      display.println(F("=== MPU6050 MOTION ==="));
      display.print(F("Acc X: ")); display.print(mpu.getAccX(), 2); display.println(F(" g"));
      display.print(F("Acc Y: ")); display.print(mpu.getAccY(), 2); display.println(F(" g"));
      display.print(F("Acc Z: ")); display.print(mpu.getAccZ(), 2); display.println(F(" g"));
      display.print(F("GyroZ: ")); display.print(mpu.getGyroZ(), 1); display.println(F(" o/s"));
    } 
    else if (displayPage == 1) {
      // --- PAGE 1: GPS Position & Quality ---
      display.println(F("=== GPS POSITION ==="));
      display.print(F("Sats: ")); display.print(gps.satellites.value());
      display.print(F(" HDOP: ")); 
      if (gps.hdop.isValid()) display.println(gps.hdop.hdop()); else display.println(F("N/A"));
      
      if (gps.location.isValid()) {
        display.print(F("Lat: ")); display.println(gps.location.lat(), 5);
        display.print(F("Lng: ")); display.println(gps.location.lng(), 5);
      } else {
        display.println(F("Status: Searching..."));
        display.println(F("Need sky view!"));
      }
    }
    else if (displayPage == 2) {
      // --- PAGE 2: GPS Dynamics & UTC Time ---
      display.println(F("=== GPS DYNAMICS ==="));
      if (gps.location.isValid()) {
        display.print(F("Alt:  ")); display.print(gps.altitude.meters(), 1); display.println(F(" m"));
        display.print(F("Spd:  ")); display.print(gps.speed.kmph(), 1); display.println(F(" km/h"));
        display.print(F("Hdg:  ")); display.print(gps.course.deg(), 1); display.println(F(" deg"));
        
        display.print(F("Time: "));
        if (gps.time.isValid()) {
          if (gps.time.hour() < 10) display.print(F("0"));
          display.print(gps.time.hour()); display.print(F(":"));
          if (gps.time.minute() < 10) display.print(F("0"));
          display.print(gps.time.minute()); display.print(F(":"));
          if (gps.time.second() < 10) display.print(F("0"));
          display.println(gps.time.second());
        } else {
          display.println(F("Syncing..."));
        }
      } else {
        display.println(F("Waiting for fix"));
        display.println(F("to read dynamics."));
      }
    }
    else {
      // --- PAGE 3: RFID Status ---
      display.println(F("=== RFID SCANNER ==="));
      display.println(F("Ready for card..."));
      display.println();
      display.print(F("Last UID:\n"));
      display.println(lastRfidTag);
    }

    display.display();
  }

  // 6. Print complete high-detail diagnostic telemetry to Serial Monitor every 2 seconds
  if (millis() - serialTimer > 2000) {
    serialTimer = millis();
    Serial.println(F("--------------------------------------------------"));
    Serial.print(F("Motion -> AccX: ")); Serial.print(mpu.getAccX(), 2);
    Serial.print(" | AccY: "); Serial.print(mpu.getAccY(), 2);
    Serial.print(" | AccZ: "); Serial.println(mpu.getAccZ(), 2);
    
    Serial.print(F("GPS Pos-> Sats: ")); Serial.print(gps.satellites.value());
    Serial.print(" | HDOP: "); Serial.print(gps.hdop.isValid() ? String(gps.hdop.hdop()) : "N/A");
    if (gps.location.isValid()) {
      Serial.print(" | Lat: "); Serial.print(gps.location.lat(), 6);
      Serial.print(" | Lng: "); Serial.println(gps.location.lng(), 6);
    } else {
      Serial.print(" | Status: Waiting for fix");
    }
    Serial.println();

    Serial.print(F("GPS Dyn-> Alt: ")); Serial.print(gps.altitude.meters(), 1); Serial.print("m");
    Serial.print(" | Speed: "); Serial.print(gps.speed.kmph(), 1); Serial.print("km/h");
    Serial.print(" | Heading: "); Serial.print(gps.course.deg(), 1); Serial.println(" deg");

    Serial.print(F("RFID   -> Last Tag: ")); Serial.println(lastRfidTag);
    Serial.println(F("--------------------------------------------------\n"));
  }
}
