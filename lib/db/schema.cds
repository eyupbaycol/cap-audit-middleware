namespace sap.audit;

entity AuditLogs {
  key ID        : UUID @(Core.Computed : true);
  timestamp     : Timestamp;
  user          : String;
  operation     : String;
  entity        : String;
  data          : LargeString;
  originalData  : LargeString;
  changes       : LargeString;
  result        : LargeString;
  success       : Boolean;
} 