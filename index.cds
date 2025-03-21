namespace sap.cap.auditLogs;

aspect AuditLogs {
  key ID        : UUID @(Core.Computed : true);
  user          : String;
  operation     : String;
  entity        : String;
  data          : LargeString;
  originalData  : LargeString;
  changes       : LargeString;
  result        : LargeString;
  success       : Integer;
} 