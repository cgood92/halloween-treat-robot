#include <Servo.h>

Servo myservo;
int pos = 125;

void setup() {
  Serial.begin(9600);
  myservo.attach(9);
  myservo.write(pos);
}

void loop() {
  delay(1000);
  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\n');

    Serial.println(command);
    if (command.startsWith("RUN")) {
      runProgram();
    }
  }
}

void runProgram() {
  for (pos = 125; pos >= 0; pos -= 1) {
    myservo.write(pos);
    delay(10);
  }
  
  delay(10000);
  
  for (pos = 0; pos <= 125; pos += 1) {
    myservo.write(pos);
    delay(10);
  }
}