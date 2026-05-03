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
  setText("parkingGuide", data.wedding.parkingGuide);
  setImage("coverPhoto", data.coverPhoto, `${data.groom.name} ${data.bride.name} 대표 사진`);

  const renderDirections = () => {
    const list = document.getElementById("directionsList");
    if (!list) return;

    const directions = data.wedding.directions || [];
    list.innerHTML = "";
    directions.forEach((direction) => {
      const item = document.createElement("li");
      item.textContent = direction;
      list.appendChild(item);
    });
  };

  const renderKakaoMap = () => {
    const mapElement = document.getElementById("kakaoMap");
    const appKey = data.wedding.kakaoAppKey;
    if (!mapElement) return;

    const fallbackLink = `<a class="map-fallback-link" href="${data.wedding.mapUrl}" target="_blank" rel="noreferrer">카카오맵에서 보기</a>`;

    if (!appKey || appKey === "YOUR_KAKAO_JAVASCRIPT_KEY") {
      mapElement.innerHTML = `<div class="map-message"><p>config.js에 카카오 JavaScript 키를 입력해 주세요.</p>${fallbackLink}</div>`;
      return;
    }

    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`;
    script.async = true;
    script.onload = () => {
      window.kakao.maps.load(() => {
        const position = new window.kakao.maps.LatLng(data.wedding.latitude, data.wedding.longitude);
        const map = new window.kakao.maps.Map(mapElement, {
          center: position,
          level: 3
        });

        const marker = new window.kakao.maps.Marker({
          map,
          position
        });

        const infoWindow = new window.kakao.maps.InfoWindow({
          content: `<div class="map-label">${data.wedding.venue}</div>`
        });
        infoWindow.open(map, marker);
      });
    };
    script.onerror = () => {
      mapElement.innerHTML = `<div class="map-message"><p>카카오맵을 불러오지 못했습니다. Kakao Developers의 JavaScript SDK 도메인 설정을 확인해 주세요.</p>${fallbackLink}</div>`;
    };

    document.head.appendChild(script);
  };

  renderDirections();
  renderKakaoMap();

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
