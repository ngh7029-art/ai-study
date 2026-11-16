const $=id=>document.getElementById(id);
let stream=null, imageData=null;
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>{
 document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x===b));
 $("cameraPane").classList.toggle("hidden",b.dataset.tab!=="camera");
 $("uploadPane").classList.toggle("hidden",b.dataset.tab!=="upload");
}));
function setImage(src){$("preview").src=src;$("preview").classList.remove("hidden");imageData=src;$("solve").disabled=false;$("status").textContent="이미지를 준비했습니다. 문제 내용을 확인한 뒤 풀이를 요청하세요.";}
$("startCam").onclick=async()=>{try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"}},audio:false});$("video").srcObject=stream;$("camHint").classList.add("hidden");$("capture").disabled=false;$("stopCam").disabled=false;$("startCam").disabled=true;}catch(e){$("status").textContent="카메라 접근에 실패했습니다. 브라우저 권한과 HTTPS 연결을 확인하세요.";}}
$("capture").onclick=()=>{const v=$("video"),c=$("canvas");c.width=v.videoWidth;c.height=v.videoHeight;c.getContext("2d").drawImage(v,0,0);setImage(c.toDataURL("image/jpeg",.88));}
$("stopCam").onclick=()=>{if(stream)stream.getTracks().forEach(t=>t.stop());stream=null;$("video").srcObject=null;$("camHint").classList.remove("hidden");$("capture").disabled=true;$("stopCam").disabled=true;$("startCam").disabled=false;}
$("file").onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>setImage(r.result);r.readAsDataURL(f);}
$("solve").onclick=async()=>{
 const q=$("question").value.trim(); if(!imageData&&!q)return;
 $("status").textContent="문제를 분석하고 있습니다…";$("answer").classList.add("hidden");
 if($("demo").checked){
  await new Promise(r=>setTimeout(r,800));
  $("answer").textContent="데모 결과\\n\\n정답: 예시 답변\\n\\n풀이: 실제 AI 연결 전 화면 흐름을 확인하기 위한 샘플입니다. 실제 문제의 정답이 아닙니다. 서버에 AI 비전 모델을 연결하면 촬영 이미지와 입력한 문제를 분석하도록 확장할 수 있습니다.";
 }else{
  try{
   const res=await fetch("./api/solve",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question:q,image_data_url:imageData})});
   if(!res.ok)throw new Error(await res.text());
   const data=await res.json();$("answer").textContent=data.answer||"응답이 비어 있습니다.";
  }catch(e){$("status").textContent="AI 서버 연결에 실패했습니다: "+e.message;return;}
 }
 $("answer").classList.remove("hidden");$("status").textContent="분석이 완료되었습니다."; $("speak").disabled=false;
};
$("speak").onclick=()=>{if(!("speechSynthesis"in window)){ $("status").textContent="이 브라우저는 음성 출력을 지원하지 않습니다.";return;}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance($("answer").textContent);u.lang="ko-KR";u.rate=1; speechSynthesis.speak(u);$("stopSpeak").disabled=false;};
$("stopSpeak").onclick=()=>{speechSynthesis.cancel();$("stopSpeak").disabled=true;};
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));