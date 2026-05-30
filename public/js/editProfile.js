const fileInput = document.getElementById('fileOpeneReg');
const previewImg = document.getElementById('preview');

fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader(); reader.onload = (e) => {
            previewImg.src = e.target.result;

        };
        reader.readAsDataURL(file);
    }
});