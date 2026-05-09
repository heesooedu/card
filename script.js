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

  const blockZoomGestures = () => {
    document.addEventListener("gesturestart", (event) => event.preventDefault());
    document.addEventListener(
      "touchmove",
      (event) => {
        if (event.touches.length > 1) event.preventDefault();
      },
      { passive: false }
    );
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

  const renderCalendar = () => {
    const monthElement = document.getElementById("calendarMonth");
    const dayElement = document.getElementById("calendarDay");
    const gridElement = document.getElementById("calendarGrid");
    if (!monthElement || !dayElement || !gridElement || !data.wedding.dateISO) return;

    const weddingDate = new Date(`${data.wedding.dateISO}T00:00:00`);
    const year = weddingDate.getFullYear();
    const month = weddingDate.getMonth();
    const day = weddingDate.getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    monthElement.textContent = `${year}. ${String(month + 1).padStart(2, "0")}`;
    dayElement.textContent = String(day);
    gridElement.innerHTML = "";

    for (let index = 0; index < firstDay; index += 1) {
      gridElement.appendChild(document.createElement("span"));
    }

    for (let date = 1; date <= lastDate; date += 1) {
      const cell = document.createElement("span");
      cell.textContent = String(date);
      if (date === day) cell.className = "is-wedding-day";
      gridElement.appendChild(cell);
    }
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
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=services&autoload=false`;
    script.async = true;
    script.onload = () => {
      window.kakao.maps.load(() => {
        const fallbackPosition = new window.kakao.maps.LatLng(data.wedding.latitude, data.wedding.longitude);
        const map = new window.kakao.maps.Map(mapElement, {
          center: fallbackPosition,
          level: 3
        });

        const marker = new window.kakao.maps.Marker({
          map,
          position: fallbackPosition
        });

        const placeId = data.wedding.mapUrl.split("/").pop();
        const places = new window.kakao.maps.services.Places();
        places.keywordSearch(data.wedding.venue, (results, status) => {
          if (status !== window.kakao.maps.services.Status.OK) return;

          const place = results.find((result) => result.id === placeId) || results[0];
          if (!place) return;

          const position = new window.kakao.maps.LatLng(Number(place.y), Number(place.x));
          marker.setPosition(position);
          map.setCenter(position);
        });

        window.kakao.maps.event.addListener(map, "click", () => {
          window.open(data.wedding.mapUrl, "_blank", "noreferrer");
        });

        window.kakao.maps.event.addListener(marker, "click", () => {
          window.open(data.wedding.mapUrl, "_blank", "noreferrer");
        });
      });
    };
    script.onerror = () => {
      mapElement.innerHTML = `<div class="map-message"><p>카카오맵을 불러오지 못했습니다. Kakao Developers의 JavaScript SDK 도메인 설정을 확인해 주세요.</p>${fallbackLink}</div>`;
    };

    document.head.appendChild(script);
  };

  blockZoomGestures();
  renderDirections();
  renderCalendar();
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
