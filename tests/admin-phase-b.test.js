'use strict';

const a=require('node:assert/strict'),p=require('../admin.js');
const article={id:'article_01J0ABCDEF1234567890ABCDEF',date:'2026-09-10',type:'项目复盘',category:'ai',reading:'5 min',title:'测试文章',summary:'摘要',body:'正文'};
const note={id:'note_01J0ABCDEF1234567890ABCDEG',date:'2026-09-10',label:'记录',category:'life',text:'正文'};
const topic={id:'topic_01J0ABCDEF1234567890ABCDEH',date:'2026-09-10',title:'专题',status:'active',text:'正文'};
const doc=()=>({schemaVersion:1,articles:[article],notes:[note],topics:[topic]});

a.doesNotThrow(()=>p.parseContentJson(JSON.stringify(doc())));
a.doesNotThrow(()=>p.parseContentJson(JSON.stringify({...doc(),articles:[{...article,type:'AI 实验'}]})));
a.throws(()=>p.parseContentJson(JSON.stringify({...doc(),articles:[{...article,type:''}]})),/type 为必填非空文本/);
const articleWithoutType={...article};
delete articleWithoutType.type;
a.throws(()=>p.parseContentJson(JSON.stringify({...doc(),articles:[articleWithoutType]})),/type 为必填非空文本/);
a.throws(()=>p.parseContentJson(JSON.stringify({...doc(),unknown:true})),/未知顶层字段/);
a.throws(()=>p.parseContentJson(JSON.stringify({...doc(),articles:[{...article,extra:'x'}]})),/未知字段/);
a.throws(()=>p.parseContentJson(JSON.stringify({...doc(),articles:[{...article,date:'2026-02-30'}]})),/日期/);
a.throws(()=>p.parseContentJson(JSON.stringify({...doc(),notes:[note,note]})),/重复 ID/);
const added={...article,id:'article_01J0ABCDEF1234567890ABCDEJ'};
a.equal(p.upsertItem(doc(),'article',added,null).articles.at(-1).id,added.id);
a.throws(()=>p.upsertItem(doc(),'article',article,null),/重复 ID/);
a.equal(p.upsertItem(doc(),'article',{...article,title:'已编辑'},article.id).articles[0].id,article.id);
a.throws(()=>p.upsertItem(doc(),'article',added,article.id),/不得改变稳定 ID/);
const u=p.ulid(0,{getRandomValues:b=>b.fill(0)});
a.equal(/^[0-9A-HJKMNP-TV-Z]{26}$/.test(u),true);
console.log('Phase B content protocol tests passed');
