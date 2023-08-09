/**
 * Module Description 
 * 
 * Version    Date                Author                Remarks
 * 1.00       March  17, 2020     Indraja              Initial Version
 *
 */

/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/error', 'N/record', 'N/runtime', 'N/format', 'N/redirect', 'N/url', 'N/email',
    'N/https'
], function(error, record, runtime, format, redirect, url, email,
    https) {
    var LOG_TITLE = 'PurchaseOrder Line Numbering';

    function beforeSubmit(context) {
        var stLogTitle = LOG_TITLE + " berforSubmit";
        log.debug(stLogTitle, 'context' + context.type);
        if (context.type == context.UserEventType.CREATE) {
            log.debug("Context type", context.type);
            var newRec;
            newRec = context.newRecord;
            var newItems = getItems(newRec);
            log.debug(stLogTitle, ' newItems length1 ' + getItems.length);
            log.debug(stLogTitle, ' newItems length2 ' + newItems);
            for (var i = 0; i < newItems; i++) {
                log.debug(stLogTitle, 'newItems ' + newItems);
                if (!isEmpty(newItems)) {
                    log.debug(stLogTitle, 'line ID Number');
                    var lines = newRec.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_line_id',
                        value: i + 1,
                        line: i
                    });
                }
            }
          log.debug(stLogTitle, 'Max Line ID Number' + newItems);
          var maxValue = newRec.setValue({
                    fieldId: 'custbody_max_line_id',
                    value: newItems,
                })
        }

        if (context.type == context.UserEventType.EDIT) {
          	log.debug("Context type", context.type);
          	var oldRec;
          	oldRec = context.oldRecord;
          	var currentRecord = context.newRecord
           	var totalitemCount = currentRecord.getLineCount({
                sublistId: 'item'
            });
          	log.debug("total item count in Edit Mode", totalitemCount);
            var maxValue = oldRec.getValue('custbody_max_line_id');
          	log.debug("Gettig Maximum Value", maxValue);
          
            for (j = 0; j < totalitemCount; j++) {
                var emptylineid = currentRecord.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_line_id',
                    line: j
                })
                log.debug("Empty Lines Length", isEmpty(emptylineid.length));
                if (isEmpty(emptylineid)) {
                  	maxValue+= 1;
                    var lineValue = currentRecord.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_line_id',
                        value: maxValue,
                        line: j
                    });
                }
            }
            var totalMaxValue = currentRecord.setValue({
                fieldId : "custbody_max_line_id",
                value: maxValue
            });
        }
    }


    function afterSubmit(context) {
        var stLogTitle = LOG_TITLE + " berforSubmit";
        log.debug(stLogTitle, 'context' + context.type);
        if (context.type == context.UserEventType.EDIT) {
            log.debug("Context type", context.type);
            var newRec;
            newRec = context.newRecord;
            var newItems = getItems(newRec);
            log.debug(stLogTitle, ' newItems length1 ' + getItems.length);
            log.debug(stLogTitle, ' newItems length2 ' + newItems);
            for (var i = 0; i < newItems; i++) {
                log.debug(stLogTitle, 'newItems ' + newItems);
                if (!isEmpty(newItems)) {
                    if (newItems) {
                        log.debug(stLogTitle, 'line ID Number');
                        var lines = newRec.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_line_id',
                            value: i + 1,
                            line: i
                        });
                    }
                }
            }
        }
    }


    function getItems(rec) {
        try {
            var stLogTitle = 'Get Items';
            var items = [];

            var itemCount = rec.getLineCount({
                sublistId: 'item'
            });
            log.debug(stLogTitle, 'Item count ' + itemCount);
            for (var i = 0; i < itemCount; i++) {

                var item = rec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    line: i
                });
                var quantity = rec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    line: i
                });
                var lineId = rec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_line_id',
                    line: i
                });
                log.debug(stLogTitle, 'Line ID ' + lineId);
            }

            return itemCount;
        } catch (error) {
            throw error;
        }
    }

    function isEmpty(value) {
        if (value == null) {
            return true;
        }
        if (value == undefined) {
            return true;
        }
        if (value == 'undefined') {
            return true;
        }
        if (value == '') {
            return true;
        }
        return false;
    }

    return {
        beforeSubmit: beforeSubmit
        //afterSubmit : afterSubmit
    };
});