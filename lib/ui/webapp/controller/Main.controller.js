sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "../model/formatter"
], function(Controller, JSONModel, Filter, FilterOperator, formatter) {
  "use strict";

  return Controller.extend("sap.audit.controller.Main", {
    formatter: formatter,
    
    onInit: function() {
      this.getView().setModel(new JSONModel({
        headerExpanded: false
      }), "viewModel");
      
      // Yükle entity tipleri ve operasyonlar
      this._loadMetadata();
    },
    
    _loadMetadata: function() {
      var oModel = this.getOwnerComponent().getModel();
      
      // Entity tipleri
      oModel.callFunction("/getEntityTypes", {
        method: "GET",
        success: function(oData) {
          var oMetadataModel = new JSONModel({
            EntityTypes: oData.results,
            Operations: [
              { Name: "CREATE" },
              { Name: "UPDATE" },
              { Name: "DELETE" }
            ]
          });
          this.getView().setModel(oMetadataModel, "/");
        }.bind(this),
        error: function(oError) {
          // Hata işleme
          console.error("Metadata yüklenirken hata oluştu:", oError);
        }
      });
    },
    
    onToggleFilter: function() {
      var oViewModel = this.getView().getModel("viewModel");
      var bExpanded = oViewModel.getProperty("/headerExpanded");
      
      oViewModel.setProperty("/headerExpanded", !bExpanded);
    },
    
    onDateRangeChange: function(oEvent) {
      // Tarih aralığı değiştiğinde yapılacak işlemler
    },
    
    onApplyFilters: function() {
      var oView = this.getView();
      var oTable = oView.byId("auditLogsTable");
      var oBinding = oTable.getBinding("items");
      
      var aFilters = [];
      
      // Entity filtresi
      var sEntity = oView.byId("entityFilter").getSelectedKey();
      if (sEntity) {
        aFilters.push(new Filter("entity", FilterOperator.EQ, sEntity));
      }
      
      // Operation filtresi
      var oOperationFilter = oView.byId("operationFilter");
      var aSelectedOperations = oOperationFilter.getSelectedKeys();
      if (aSelectedOperations.length > 0) {
        var aOperationFilters = [];
        aSelectedOperations.forEach(function(sOperation) {
          aOperationFilters.push(new Filter("operation", FilterOperator.EQ, sOperation));
        });
        aFilters.push(new Filter({
          filters: aOperationFilters,
          and: false
        }));
      }
      
      // Tarih aralığı filtresi
      var oDateRange = oView.byId("dateFilter");
      if (oDateRange.getDateValue() && oDateRange.getSecondDateValue()) {
        aFilters.push(new Filter("timestamp", FilterOperator.BT, 
          oDateRange.getDateValue(), oDateRange.getSecondDateValue()));
      }
      
      // Kullanıcı filtresi
      var sUser = oView.byId("userFilter").getValue();
      if (sUser) {
        aFilters.push(new Filter("user", FilterOperator.Contains, sUser));
      }
      
      // Filtreleri uygula
      oBinding.filter(aFilters);
    },
    
    onResetFilters: function() {
      var oView = this.getView();
      
      oView.byId("entityFilter").setSelectedKey("");
      oView.byId("operationFilter").setSelectedKeys([]);
      oView.byId("dateFilter").setValue("");
      oView.byId("userFilter").setValue("");
      
      var oTable = oView.byId("auditLogsTable");
      var oBinding = oTable.getBinding("items");
      oBinding.filter([]);
    },
    
    onItemPress: function(oEvent) {
      var oItem = oEvent.getSource();
      var oContext = oItem.getBindingContext();
      var sPath = oContext.getPath();
      var sLogId = oContext.getProperty("ID");
      
      this.getOwnerComponent().getRouter().navTo("detail", {
        logId: sLogId
      });
    },
    
    onViewDetails: function(oEvent) {
      // Olay yayılımını durdur
      oEvent.stopPropagation();
      
      var oButton = oEvent.getSource();
      var oContext = oButton.getBindingContext();
      var sLogId = oContext.getProperty("ID");
      
      this.getOwnerComponent().getRouter().navTo("detail", {
        logId: sLogId
      });
    },
    
    onShowStatistics: function() {
      this.getOwnerComponent().getRouter().navTo("statistics");
    }
  });
}); 