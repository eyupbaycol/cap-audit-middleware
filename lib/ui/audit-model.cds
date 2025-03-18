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

@path: 'audit'
service AuditService {
  entity Logs as projection on AuditLogs order by timestamp desc;
  
  type DetailResult {
    ID: UUID;
    timestamp: Timestamp;
    user: String;
    operation: String;
    entity: String;
    data: LargeString;
    originalData: LargeString;
    changes: LargeString;
    result: LargeString;
    success: Boolean;
  }
  
  type StatisticsResult {
    operation: String;
    entity: String;
    count: Integer;
  }
  
  action getDetails(id: UUID) returns DetailResult;
  action getStatistics(
    startDate: Timestamp,
    endDate: Timestamp,
    entity: String
  ) returns many StatisticsResult;
} 