var celigotest1 = function(){r = nlapiTransformRecord("invoice", 3552096, "creditmemo", {});
r.setFieldValue("custbody_celigo_etail_refund_id", "845335330890");
r.setFieldValue("custbody_celigo_etail_refund_exp", "T");
r.setFieldValue("custbody_celigo_etail_transaction_ids", "re_3LTuajJOxOaAAVzP0oV2hyve");
r.setFieldValue("custbody_cm_order_type", 5);
r.setFieldValue("department", 33);
r.setFieldValue("shippingcost", 0);
r.setFieldValue("location", 7);
r.setFieldValue("discountrate", 0);
r.setFieldValue("custbody_celigo_shpfy_transaction_ids", "5526137077834");
r.removeLineItem("item", 1);
r.selectLineItem("item", 1);
r.removeCurrentLineItemSubrecord("item", "inventorydetail");
r.setCurrentLineItemValue("item", "custcol_celigo_etail_order_line_id", 11404403900490);
r.setCurrentLineItemValue("item", "department", 33);
r.setCurrentLineItemValue("item", "line", "8");
r.setCurrentLineItemValue("item", "quantity", 0);
r.setCurrentLineItemValue("item", "amount", "90.00");
r.commitLineItem("item");
nlapiSubmitRecord(r, false, false);
};
 