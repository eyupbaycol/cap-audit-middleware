sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "../model/formatter"
], function(Controller, JSONModel, formatter) {
  "use strict";

  return Controller.extend("sap.audit.controller.Detail", {
    formatter: formatter,
    
    onInit: function() {
      this.getOwnerComponent().getRouter().getRoute("detail").attachPatternMatched(this._onPatternMatched, this);
      this.getView().setModel(new JSONModel(), "logDetails");
    },
    
    _onPatternMatched: function(oEvent) {
      var sLogId = oEvent.getParameter("arguments").logId;
      this._loadLogDetails(sLogId);
    },
    
    _loadLogDetails: function(sLogId) {
      var oModel = this.getOwnerComponent().getModel();
      
      oModel.callFunction("/getDetails", {
        method: "POST",
        urlParameters: {
          id: sLogId
        },
        success: function(oData) {
          var oLogDetailsModel = this.getView().getModel("logDetails");
          oLogDetailsModel.setData(oData);
        }.bind(this),
        error: function(oError) {
          // Hata işleme
          console.error("Log detayları yüklenirken hata oluştu:", oError);
          sap.m.MessageBox.error("Log detayları yüklenemedi.");
        }
      });
    },
    
    onNavBack: function() {
      this.getOwnerComponent().getRouter().navTo("main");
    }
  });
}); 