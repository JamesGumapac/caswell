/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/search'], (nRecord, nSearch) => {

    const BINS_BY_LOCATION = {};

    const beforeSubmit = context => {
        if (context.type !== context.UserEventType.CREATE && context.type !== context.UserEventType.EDIT) {
            return;
        }

        const newRecord = context.newRecord;
        try {
            // const irRec = nRecord.load({
            //     type: newRecord.type,
            //     id: newRecord.id,
            //     isDynamic: true
            // });
            const irRec = newRecord;
            const lineCount = irRec.getLineCount({ sublistId: 'item' });
            const binNumber = irRec.getValue({ fieldId: 'custbody_bin_number' });
            let bin;

            if (!binNumber) {
                log.audit({ title: 'No bin number', details: 'BIN NAME is empty' });
                return;
            }

            let inventoryAssignmentLineCount = 0;
            let item;
            let isBinItem = false;
            let location;
            let hasSublistSubrecord = false;
            let inventoryDetailRecord;
            let inventoryDetailQuantity = 0;
            for (let i = 0; i < lineCount; i++) {
                // irRec.selectLine({ sublistId: 'item', line: i });
                item  = irRec.getSublistValue({ sublistId: 'item', line: i, fieldId: 'itemname' });
                isBinItem = irRec.getSublistValue({ sublistId: 'item', line: i, fieldId: 'binitem' }) === 'T';
                location = irRec.getSublistValue({ sublistId: 'item', line: i, fieldId: 'location' });
                lineQty = irRec.getSublistValue({ sublistId: 'item', line: i, fieldId: 'quantity' });
                hasSublistSubrecord = irRec.getSublistValue({ sublistId: 'item', line: i, fieldId: 'inventorydetail' });
                log.debug('invDetail Subrecord:', hasSublistSubrecord);
                log.debug({ title: `${item} is a bin item?`, details: isBinItem });
                if (isBinItem) {
                    bin = getBin(binNumber, location);
                    inventoryDetailRecord = irRec.getSublistSubrecord({ sublistId: 'item', line: i, fieldId: 'inventorydetail' });
                    log.debug('inventoryDetailRecord:', inventoryDetailRecord);
                    inventoryDetailQuantity = inventoryDetailRecord.getValue({ fieldId: 'quantity' });
                    inventoryAssignmentLineCount = inventoryDetailRecord.getLineCount({ sublistId: 'inventoryassignment' });
                  log.debug('inventoryAssignmentLineCount:', inventoryAssignmentLineCount);
                //    for (let j = 0; j < inventoryAssignmentLineCount; j++) {
                        // inventoryDetailRecord.selectLine({ sublistId: 'inventoryassignment', line: j });
                        inventoryDetailRecord.setSublistValue({ sublistId: 'inventoryassignment', line: 0, fieldId: 'binnumber', value: bin?.id });
                  inventoryDetailRecord.setSublistValue({ sublistId: 'inventoryassignment', line: 0, fieldId: 'quantity', value: lineQty });
                  log.debug('Set line')
                        // inventoryDetailRecord.commitLine({ sublistId: 'inventoryassignment' });
                //    }
                }
                // irRec.commitLine({ sublistId: 'item' });
            }
            // irRec.save({ enableSourcing: true, ignoreMandatoryFields: true });
        } catch (ex) {
            log.error({ title: ex.name, details: ex });
        }
    }

    const getBin = (binNumber, locationId) => {
        let location;
        if (!BINS_BY_LOCATION[location] || !BINS_BY_LOCATION[location][binNumber]) {
            const searchObj = nSearch.create({
                type: nSearch.Type.BIN,
                columns: [
                    { name: 'binnumber' },
                    { name: 'location' }
                ],
                filters: [
                    [ 'binnumber', 'is', binNumber ],
                    'AND',
                    [ 'location', 'is', locationId ],
                    'AND',
                    [ 'inactive', 'is', 'F' ]
                ]
            });
            let pagedData = searchObj.runPaged({ pageSize: 1000 });
            for (var idx = 0; idx < pagedData.pageRanges.length; idx++) {
                page = pagedData.fetch(pagedData.pageRanges[idx]);
                page.data.forEach(row => {
                    location = row.getValue({ name: 'location' });
                    if (!BINS_BY_LOCATION[location]) {
                        BINS_BY_LOCATION[location] = {};
                    }
                    if (!BINS_BY_LOCATION[location][binNumber]) {
                        BINS_BY_LOCATION[location][binNumber] = {
                            id: row.id,
                            binNumber: row.getValue({ name: 'binnumber' }),
                            location: row.getValue({ name: 'location' }),
                        };
                    }
                });
            }
        }
        log.debug({ title: 'BINS_BY_LOCATION', details: BINS_BY_LOCATION });
        return BINS_BY_LOCATION[locationId] && BINS_BY_LOCATION[locationId][binNumber];
    }

    return { beforeSubmit };
});