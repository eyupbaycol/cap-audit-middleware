namespace sap.cap.auditLogs;

entity AutditLogs  {
key ID        : UUID;
  name        : String(100) not null;
  description : String(1000);
  price       : Decimal(15, 2);
}