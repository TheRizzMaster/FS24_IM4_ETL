const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');
console.log(id);

const title = document.querySelectorAll('.title');

title.forEach((item) => {
    item.innerHTML = id;
});