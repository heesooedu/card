(function () {
  const data = window.INVITATION;

  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  };

  const setImage = (id, src, alt) => {
    const image = document.getElementById(id);
    if (!image) return;
    image.src = src;
    image.alt = alt;
    image.onerror = () => {
      image.classList.add("is-missing");
      image.removeAttribute("src");
    };
  };

  setText("groomName", data.groom.name);
  setText("brideName", data.bride.name);
  setText("groomNameDetail", data.groom.name);
  setText("brideNameDetail", data.bride.name);
  setText("groomParents", data.groom.parents);
  setText("brideParents", data.bride.parents);
  setText("weddingDateText", data.wedding.dateShort);
  setText("weddingDateDetail", data.wedding.dateLong);
  setText("venueName", data.wedding.venue);
  setText("venueAddress", data.wedding.address);
  setText("messageText", data.message);
  setImage("coverPhoto", data.coverPhoto, `${data.groom.name} ${data.bride.name} 대표 사진`);

  const venueMap = document.getElementById("venueMap");
  if (venueMap && data.wedding.mapEmbedUrl) {
    venueMap.src = data.wedding.mapEmbedUrl;
  }

  const gallery = document.getElementById("gallery");
  if (gallery) {
    let currentPhoto = 0;
    const photos = data.photos.filter(Boolean);

    gallery.innerHTML = `
      <figure class="gallery-view">
        <img id="galleryPhoto" alt="" draggable="false" />
      </figure>
      <div class="gallery-controls" aria-label="사진 넘기기">
        <button id="prevPhoto" class="gallery-button" type="button" aria-label="이전 사진">‹</button>
        <span id="galleryCount" class="gallery-count"></span>
        <button id="nextPhoto" class="gallery-button" type="button" aria-label="다음 사진">›</button>
      </div>
    `;

    const galleryPhoto = document.getElementById("galleryPhoto");
    const galleryCount = document.getElementById("galleryCount");
    const prevPhoto = document.getElementById("prevPhoto");
    const nextPhoto = document.getElementById("nextPhoto");

    const renderPhoto = () => {
      if (!galleryPhoto || !galleryCount || photos.length === 0) return;
      galleryPhoto.src = photos[currentPhoto];
      galleryPhoto.alt = `${data.groom.name} ${data.bride.name} 사진 ${currentPhoto + 1}`;
      galleryCount.textContent = `${currentPhoto + 1} / ${photos.length}`;
    };

    const movePhoto = (direction) => {
      currentPhoto = (currentPhoto + direction + photos.length) % photos.length;
      renderPhoto();
    };

    if (photos.length <= 1) {
      prevPhoto.disabled = true;
      nextPhoto.disabled = true;
    }

    prevPhoto.addEventListener("click", () => {
      movePhoto(-1);
    });

    nextPhoto.addEventListener("click", () => {
      movePhoto(1);
    });

    let touchStartX = 0;
    gallery.addEventListener("touchstart", (event) => {
      touchStartX = event.changedTouches[0].clientX;
    });

    gallery.addEventListener("touchend", (event) => {
      const touchEndX = event.changedTouches[0].clientX;
      const distance = touchEndX - touchStartX;
      if (Math.abs(distance) < 45 || photos.length <= 1) return;
      movePhoto(distance > 0 ? -1 : 1);
    });

    renderPhoto();
  }

  const accounts = document.getElementById("accounts");
  if (accounts) {
    [
      ["신랑측", data.groom.account],
      ["신부측", data.bride.account]
    ].forEach(([label, account]) => {
      const item = document.createElement("div");
      item.className = "account-item";
      item.innerHTML = `<span>${label}</span><strong>${account}</strong>`;
      accounts.appendChild(item);
    });
  }
})();
