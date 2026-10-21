import firebaseConfig from './firebase-config.js';
const B='https://www.gstatic.com/firebasejs/10.14.1/';
try{
 if(!firebaseConfig.apiKey||firebaseConfig.apiKey.startsWith('COLE')){cloudInit(null)}
 else{
  const [AP,A,S]=await Promise.all([import(B+'firebase-app.js'),import(B+'firebase-auth.js'),import(B+'firebase-firestore.js')]);
  const app=AP.initializeApp(firebaseConfig),auth=A.getAuth(app);
  const db=S.initializeFirestore(app,{localCache:S.persistentLocalCache({})});
  let uid=null,unsubs=[];
  const w=p=>p.catch(e=>alert('Não foi possível salvar na nuvem ('+(e.code||'erro')+').'));
  const api={
   login:(e,p)=>A.signInWithEmailAndPassword(auth,e,p),
   signup:(e,p)=>A.createUserWithEmailAndPassword(auth,e,p),
   reset:e=>A.sendPasswordResetEmail(auth,e),
   logout:()=>A.signOut(auth),
   setLan:(id,o)=>w(S.setDoc(S.doc(db,'users',uid,'lan',id),o)),
   delLan:id=>w(S.deleteDoc(S.doc(db,'users',uid,'lan',id))),
   setCfg:o=>w(S.setDoc(S.doc(db,'users',uid,'cfg','main'),o,{merge:true}))
  };
  cloudInit(api);
  A.onAuthStateChanged(auth,u=>{
   unsubs.forEach(x=>x());unsubs=[];uid=u?u.uid:null;
   cloudAuth(u?{email:u.email}:null);
   if(!u)return;
   let c=null,l=null,first=true;
   const run=()=>{
    if(!c||!l)return;
    if(first){
     first=false;
     let o=null;try{o=JSON.parse(localStorage.getItem('tetodia.v1')||'null')}catch{}
     if(o&&o.lan&&!localStorage.getItem('tetodia.mig')&&!l.length&&!Object.keys(c.orc||{}).length&&(o.lan.length||Object.keys(o.orc||{}).length)){
      localStorage.setItem('tetodia.mig','1');
      o.lan.forEach(x=>api.setLan(x.id,x));
      api.setCfg({orc:o.orc||{},fech:o.fech||{}});
      return;
     }
    }
    cloudData(c,l);
   };
   const err=e=>alert('Não foi possível ler a nuvem ('+e.code+'). Confira as regras do Firestore.');
   unsubs=[
    S.onSnapshot(S.doc(db,'users',u.uid,'cfg','main'),s=>{c=s.data()||{};run()},err),
    S.onSnapshot(S.collection(db,'users',u.uid,'lan'),s=>{l=s.docs.map(d=>({id:d.id,...d.data()}));run()},err)
   ];
  });
 }
}catch(e){cloudFail()}
