const uploadInput=document.getElementById('uploadInput');
const fileContainer=document.getElementById('fileContainer');

uploadInput.addEventListener('change',function(){
  const file=this.files[0];
  if(!file) return;

  const div=document.createElement('div');
  div.className='file-item';

  div.innerHTML=`
    <h3>${file.name}</h3>
    <p>Secure file added to SafeLock vault</p>
    <div class="file-actions">
      <button class="primary-btn download-btn">Download</button>
      <button class="secondary-btn delete-btn">Delete</button>
    </div>
  `;

  div.querySelector('.download-btn').onclick=()=>{
    const link=document.createElement('a');
    link.href=URL.createObjectURL(file);
    link.download=file.name;
    link.click();
  };

  div.querySelector('.delete-btn').onclick=()=>{
    div.remove();
  };

  fileContainer.appendChild(div);
});