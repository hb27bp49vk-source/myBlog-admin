'use strict';

const assert=require('node:assert/strict');
const admin=require('../admin.js');
const fixture=require('./fixtures/test-content-schema-shapes.json');
const editableValues=(kind,item)=>Object.fromEntries(admin.RULES[kind].required.map(key=>[key,item[key]]));
const roundTrip=(kind,item)=>{const serialized=admin.serializeItem(kind,editableValues(kind,item),item);admin.validateItem(kind,serialized);assert.deepEqual(serialized,item,kind+' serialized item must preserve every field');const saved=admin.upsertItem(structuredClone(fixture),kind,serialized,item.id);assert.deepEqual(saved[admin.COLLECTIONS[kind]].find(entry=>entry.id===item.id),item,kind+' saved item must preserve every field')};

assert.doesNotThrow(()=>admin.parseContentJson(JSON.stringify(fixture)));
fixture.articles.forEach(item=>roundTrip('article',item));
fixture.notes.forEach(item=>roundTrip('note',item));
fixture.topics.forEach(item=>roundTrip('topic',item));
assert.equal(fixture.articles[0].type,'项目复盘');
assert.equal(fixture.articles[0].date,'2026.09.08');
assert.equal(fixture.topics[0].date,'2026.08—09');
assert.deepEqual(admin.serializeItem('article',editableValues('article',fixture.articles[0]),fixture.articles[0]).cover,fixture.articles[0].cover);
assert.deepEqual(admin.serializeItem('article',editableValues('article',fixture.articles[0]),fixture.articles[0]).imageRefs,fixture.articles[0].imageRefs);
assert.equal(admin.serializeItem('topic',editableValues('topic',fixture.topics[0]),fixture.topics[0]).category,fixture.topics[0].category);
assert.throws(()=>admin.validateItem('article',{...fixture.articles[0],date:''}),/date 为必填非空文本/);
assert.throws(()=>admin.validateItem('article',{...fixture.articles[0],type:''}),/type 为必填非空文本/);
assert.throws(()=>admin.validateItem('article',{...fixture.articles[0],id:'article_8ZZZZZZZZZZZZZZZZZZZZZZZZZ'}),/ID 必须/);
assert.throws(()=>admin.validateItem('article',{...fixture.articles[0],unexpected:'reject'}),/未知字段/);
assert.doesNotThrow(()=>admin.validateItem('article',{...fixture.articles[0],category:'custom-category'}));
const newArticle=admin.serializeItem('article',editableValues('article',fixture.articles[0]),null);
assert.equal(Object.hasOwn(newArticle,'cover'),false);
assert.equal(Object.hasOwn(newArticle,'imageRefs'),false);
assert.doesNotThrow(()=>admin.validateItem('article',newArticle));
console.log('Phase B content protocol and round-trip tests passed');
