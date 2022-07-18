var url = "/get-songs";
var songs;

document.getElementsByClassName('loader')[0].style.display = 'flex';

export default (async () =>{
    await $.get(url,function(data, status) {
        console.log("got response for songs request");
        if(data)
        songs = data;
        console.log('status');
        console.log(status);
        if(status != "success"){
            document.getElementsByClassName('loader')[0].style.display = 'none';
            throw new HttpException(404, 'Page not found');
        }
    });
})();

export {songs};