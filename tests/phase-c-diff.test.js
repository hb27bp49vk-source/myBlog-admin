'use strict';
const assert=require('node:assert/strict'),c=require('../phase-c.js');
const source={schemaVersion:1,articles:[{id:'article_01J7T4QFK0Y2V9N7Q8P6R3S5D1',title:'New',date:'2026',body:'n'},{id:'article_01J7T4QFK0Y2V9N7Q8P6R3S5D2',title:'Changed',date:'2026',body:'new'},{id:'article_01J7T4QFK0Y2V9N7Q8P6R3S5D3',title:'Same',date:'2026',body:'same'}],notes:[],topics:[]};
const prod={schemaVersion:1,articles:[{...source.articles[1],body:'old'},source.articles[2]],notes:[],topics:[]};
(async()=>{const rows=await c.classify(source,prod);assert.deepEqual(rows.map(x=>x.status),['new','updated','unchanged']);assert.deepEqual(c.filterEntries(rows,true).map(x=>x.value.title),['New','Changed']);assert.equal(c.filterEntries(rows,false).length,3);console.log('Phase C diff classification tests passed')})().catch(e=>{throw e});
