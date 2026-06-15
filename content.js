// 1. СЮДА ВСТАВЛЯЕШЬ БАЗУ ДАННЫХ ИЗ ПРОГРАММЫ
const POSTS_DATABASE = [
    {
        id: "patch___________",
        timestamp: 1781524800000,
        date: "15.06.2026",
        tags: ["#Intec", "#Новости"],
        title: {
            en: "ввфывывыфв",
            ru: "ввфывывыфв"
        },
        textRaw: { 
            en: "",
            ru: "вцфвцфввцфвцфвцф"
        },
        contentFile: "articles/patch_001.json" 
    }
];

const PAGE_CONTENT = {
    // ==========================================
    // RACE LEGENDS
    // ==========================================
    'rl': `
        <div class="hero-card">
            <div class="hero-banner hero-bg-rl"><h1 class="hero-title">RACE LEGENDS</h1></div>
            <div class="hero-footer">
                <div class="tags-group">
                    <div class="tag">#UnrealEngine5</div><div class="tag">#BattleRoyale</div><div class="tag">#PreAlpha</div>
                </div>
                <div class="tags-group">
                    <div class="tag tag-status">
                        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        <span data-lang="en">In development</span><span data-lang="ru">В разработке</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="content-card">
            <div class="info-text">
                <div data-lang="en">
                    <h2>Battle Royale in a new format</h2>
                    <p>A match lasts about twenty minutes, and the objective is familiar — be the last one standing. There is no classic shrinking circle here. Instead, there's a <span class="highlight">chaotic storm</span>. Its boundaries constantly pulsate, change direction, and burst deep into the island. A spot that was a safe haven a second ago can suddenly become a death trap. You have to <span class="highlight">keep moving</span> and change tactics.</p>
                </div>
                <div data-lang="ru">
                    <h2>Королевская битва в новом формате</h2>
                    <p>Матч длится около двадцати минут, и задача привычная — остаться последним выжившим. Здесь нет классического сужающегося круга. Вместо него — <span class="highlight">хаотичный шторм</span>. Его границы постоянно пульсируют, меняют направление и прорываются вглубь острова. Место, которое секунду назад было безопасным укрытием, может внезапно оказаться смертельной ловушкой. Приходится <span class="highlight">постоянно двигаться</span> и менять тактику.</p>
                </div>
            </div>
            <div class="info-console"><canvas class="mini-console" data-type="storm"></canvas></div>
        </div>

        <div class="content-card">
            <div class="info-text">
                <div data-lang="en">
                    <h2>Cannon Volley and Drop</h2>
                    <p>No long airplane flights. The match begins with a <span class="highlight">cannon volley</span>. All players sit in giant cannons around the island's perimeter. You set the power and trajectory yourself, and then all guns fire simultaneously. Mid-air, you're in a pod, and you have two choices. First — detonate the pod in flight and <span class="highlight">deploy the glider</span>. It's slower, but you can land precisely on the roof you need. The second — <span class="highlight">crash landing</span>. The pod drops like a meteorite along the set trajectory.</p>
                </div>
                <div data-lang="ru">
                    <h2>Пушечный залп и спуск</h2>
                    <p>Никаких долгих полетов на самолете. Матч начинается с <span class="highlight">пушечного залпа</span>. Все игроки сидят в гигантских пушках по периметру острова. Вы сами настраиваете мощность и траекторию, а затем все орудия стреляют одновременно. В воздухе вы находитесь в капсуле, и у вас два пути. Первый — подорвать капсулу в полете и <span class="highlight">раскрыть дельтаплан</span>. Это медленно, но зато можно приземлиться точно на нужную крышу. Второй путь — <span class="highlight">краш-лендинг</span>. Капсула падает, как метеорит, по заданной траектории.</p>
                </div>
            </div>
            <div class="info-console"><canvas class="mini-console" data-type="launch_drop"></canvas></div>
        </div>

        <div class="content-card">
            <div class="info-text">
                <div data-lang="en">
                    <h2>From Pistol to Mega-Gun</h2>
                    <p>Everyone is equal at the start — each has only a pickaxe and a basic pistol. <span class="highlight">Weapons cannot be dropped</span>. Instead of searching for new guns, you <span class="highlight">collect modules</span>. By finding the right parts, you gradually turn a regular starting pistol into heavy artillery. Everyone has a fixed 100 health. There's no shield initially. To get it, you need to find a special injector — <span class="highlight">p-syzh</span>. It restores armor to 100%, but very slowly: one point per second. <span class="highlight">Any damage taken immediately stops regeneration</span>, so you have to heal behind cover.</p>
                </div>
                <div data-lang="ru">
                    <h2>От пистолета до мега-пушки</h2>
                    <p>На старте все равны — у каждого есть только кирка и базовый пистолет. <span class="highlight">Оружие нельзя выбросить</span>. Вместо того чтобы искать новые стволы, вы <span class="highlight">собираете модули</span>. Находя нужные детали, вы постепенно превращаете обычный стартовый пистолет в тяжелую артиллерию. Здоровье у всех фиксированное — 100 единиц. Щита на старте нет. Чтобы его получить, нужно найти специальный инъектор — <span class="highlight">псыж</span>. Он восстанавливает броню до 100%, но очень медленно: по одной единице в секунду. <span class="highlight">Любой полученный урон сразу сбивает регенерацию</span>, поэтому лечиться придется в укрытиях.</p>
                </div>
            </div>
            <div class="info-console"><canvas class="mini-console" data-type="weapon"></canvas></div>
        </div>

        <div class="content-card">
            <div class="info-text">
                <div data-lang="en">
                    <h2>Stylized Bubbles</h2>
                    <p>The map isn't simply divided into forest or desert. The arena features localized <span class="highlight">altered reality zones</span>. Running into such an area, you literally enter a <span class="highlight">different visual style</span>. For example, in one zone, the picture becomes black and white and contrasted, like a noir detective story. In another, the screen is covered with static and distortions in the spirit of an old VHS tape.</p>
                </div>
                <div data-lang="ru">
                    <h2>Стилизованные пузыри</h2>
                    <p>Карта поделена не просто на лес или пустыню. На арене есть локальные <span class="highlight">зоны с измененной реальностью</span>. Забегая в такую область, вы буквально попадаете в <span class="highlight">другой визуальный стиль</span>. Например, в одной зоне картинка становится черно-белой и контрастной, как в нуарном детективе. В другой зоне экран покрывается помехами и искажениями в духе старой VHS-кассеты.</p>
                </div>
            </div>
            <div class="info-console"><canvas class="mini-console" data-type="bubble"></canvas></div>
        </div>

        <div class="content-card">
            <div class="info-text">
                <div data-lang="en">
                    <h2>Madness on Wheels</h2>
                    <p>When the second phase of the match arrives, players can <span class="highlight">summon vehicles</span>. The car drops right from the sky in a pod, destroying buildings in its path. You can attach modules to it too: guns, turbines, energy shields. If the car is destroyed, <span class="highlight">you don't die instantly</span> — the explosion launches you into the air and deals damage, after which you can deploy a glider and retreat. In team mode, vehicles reach their full potential. Players select one car for the entire team in advance, and it becomes a mobile fortress. <span class="highlight">Control is shared among everyone</span>: one steers, a second shoots from the turret, a third manages scanners and shields. Success depends on how well you coordinate.</p>
                </div>
                <div data-lang="ru">
                    <h2>Безумие на колесах</h2>
                    <p>Когда наступает вторая фаза матча, игроки могут <span class="highlight">вызывать технику</span>. Машина падает прямо с неба в капсуле, разрушая здания на своем пути. На нее тоже можно вешать модули: пушки, турбины, защитные поля. Если машину уничтожат, <span class="highlight">вы не умираете сразу</span> — взрыв подкинет вас в воздух и нанесет урон, после чего можно будет раскрыть дельтаплан и отступить. В командном режиме техника раскрывается на полную. Игроки заранее выбирают одну машину на всю команду, и она становится мобильной крепостью. <span class="highlight">Управление делится на всех</span>: один рулит, второй стреляет из турели, третий отвечает за сканеры и щиты. Успех зависит от того, насколько хорошо вы координируете действия.</p>
                </div>
            </div>
            <div class="info-console"><canvas class="mini-console" data-type="car"></canvas></div>
        </div>
    `,

    // ==========================================
    // FRACTAL FORGE
    // ==========================================
    'ff': `
        <div class="hero-card">
            <div class="hero-banner hero-bg-ff"><h1 class="hero-title">FRACTAL FORGE</h1></div>
            <div class="hero-footer">
                <div class="tags-group">
                    <div class="tag">#BlenderAddon</div><div class="tag">#PreAlpha</div>
                </div>
                <div class="tags-group">
                    <a href="https://github.com/ZAKFUN35/FractalForge" target="_blank" class="nav-btn" style="width: max-content; margin: 0; padding: 0 12px;">
                        <svg class="nav-icon" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        <span data-lang="en">Download</span><span data-lang="ru">Скачать</span>
                    </a>
                </div>
            </div>
        </div>

        <div class="content-card">
            <div class="info-text">
                <div data-lang="en">
                    <h2>Generation Instead of Routine</h2>
                    <p>Fractal Forge takes over the most tedious part of modeling. Instead of manually placing every single leaf, you generate ready-made vegetation via <span class="highlight">Geometry Nodes</span>. The addon instantly creates meshes fully ready for export to a game engine: with correct UV unwrapping, baked Vertex Color, and necessary attributes for masks. And if you need a dense canopy in <span class="highlight">Studio Ghibli</span> style, the base geometry turns into a proper stylized volume in a couple of clicks.</p>
                </div>
                <div data-lang="ru">
                    <h2>Генерация вместо рутины</h2>
                    <p>Fractal Forge забирает на себя самую душную часть моделирования. Вместо того чтобы вручную расставлять каждый листик, вы генерируете готовую растительность через <span class="highlight">Geometry Nodes</span>. Аддон сразу создает меши, полностью готовые к экспорту в игровой движок: с правильными UV-развертками, запеченным Vertex Color и необходимыми атрибутами для масок. А если нужна густая крона в стиле <span class="highlight">Studio Ghibli</span>, базовая геометрия превращается в правильный стилизованный объем за пару кликов.</p>
                </div>
            </div>
            <div class="info-console"><canvas class="mini-console" data-type="gen"></canvas></div>
        </div>

        <div class="content-card">
            <div class="info-text">
                <div data-lang="en">
                    <h2>Custom Normals in One Click</h2>
                    <p>The main enemy of 3D trees is that every leaf casts its own shadow, turning the canopy into a noisy <span class="highlight">mess</span>. The tool solves this problem in one click. The addon automatically recalculates and transfers custom spherical normals to your foliage. The tree begins to perceive light as a single monolithic object. You get those clean, smooth shadows for proper <span class="highlight">cel-shading</span> without spending hours manually tweaking modifiers.</p>
                </div>
                <div data-lang="ru">
                    <h2>Кастомные нормали в один клик</h2>
                    <p>Главный враг 3D-деревьев — каждый лист отбрасывает собственную тень, превращая крону в шумное <span class="highlight">нечто</span>. Инструмент решает эту проблему в один клик. Аддон автоматически пересчитывает и переносит кастомные сферические нормали на вашу листву. Дерево начинает воспринимать свет как единый монолитный объект. Вы получаете те самые чистые, сглаженные тени для правильного <span class="highlight">cel-shading</span>, не тратя часы на ручную настройку модификаторов.</p>
                </div>
            </div>
            <div class="info-console"><canvas class="mini-console" data-type="normals"></canvas></div>
        </div>

        <div class="content-card">
            <div class="info-text">
                <div data-lang="en">
                    <h2>Engine Optimization</h2>
                    <p>Stylized graphics shouldn't kill FPS. The addon instantly optimizes models for the strict requirements of game engines like <span class="highlight">UE5</span>. It automatically generates Levels of Detail <span class="highlight">(LOD)</span> and properly slices the geometry. For example, a generated patch of grass is neatly split into independent blades, and the origin is placed strictly at the base of each stem. This is critical for cheap wind animation in the engine via <span class="highlight">World Position Offset (WPO)</span> without heavy bones.</p>
                </div>
                <div data-lang="ru">
                    <h2>Оптимизация под движок</h2>
                    <p>Стилизованная графика не должна убивать FPS. Аддон сразу оптимизирует модели под жесткие требования игровых движков вроде <span class="highlight">UE5</span>. Он автоматически генерирует уровни детализации <span class="highlight">(LOD)</span> и правильно нарезает геометрию. Например, сгенерированная поляна аккуратно разбивается на независимые травинки, а центр координат (origin) ставится строго в основание каждого стебля. Это критически важно, чтобы в движке можно было сделать дешевую анимацию ветра через <span class="highlight">World Position Offset (WPO)</span> без тяжелых костей.</p>
                </div>
            </div>
            <div class="info-console"><canvas class="mini-console" data-type="opt"></canvas></div>
        </div>

        <div class="content-card">
            <div class="info-text">
                <div data-lang="en">
                    <h2>Community Platform</h2>
                    <p>Right now, Fractal Forge is a utility for solving technical tasks in Race Legends. But the global goal is much bigger. In future updates, the addon will receive a custom cel-shading engine based on the <span class="highlight">Oklab</span> perceptual color space, where light and shadow transitions will be mathematically flawless to the human eye. This will turn the addon into a tool for the community: players will be able to create locations, item designs, and skins themselves. You do great work, send it to me, and if it's excellent — it <span class="highlight">officially gets added to the game</span>.</p>
                </div>
                <div data-lang="ru">
                    <h2>Платформа для комьюнити</h2>
                    <p>Сейчас Fractal Forge — это утилита для решения технических задач в Race Legends. Но глобальная цель куда масштабнее. В будущих обновлениях аддон получит кастомный движок cel-shading на базе перцептивного цветового пространства <span class="highlight">Oklab</span>, где переходы света и тени будут математически безупречны для человеческого глаза. Это превратит аддон в инструмент для сообщества: игроки смогут сами создавать локации, дизайны предметов и скины. Вы делаете крутую работу, присылаете мне, и если всё отлично — она <span class="highlight">официально добавляется в игру</span>.</p>
                </div>
            </div>
            <div class="info-console"><canvas class="mini-console" data-type="comm"></canvas></div>
        </div>
    `,

    // ==========================================
    // #RACELEGENDSTV
    // ==========================================
    'rltv': `
        <div class="hero-card">
            <div class="hero-banner hero-bg-rltv"><h1 class="hero-title">#RaceLegendsTV</h1></div>
            <div class="hero-footer">
                <div class="tags-group">
                    <div class="tag">#Community</div><div class="tag">#UGC</div>
                </div>
                <div class="tags-group">
                    <div class="tag tag-status">
                        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        <span data-lang="en">Waiting for community signal</span><span data-lang="ru">Ожидание сигнала сообщества</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="tv-combined-card">
            <div class="tv-screen" id="tvScreen">
                <div class="tv-bars" id="tvBars"></div>
                <div class="tv-text-box" id="tvTextBox">
                    <span data-lang="en">WAITING FOR COMMUNITY SIGNAL</span>
                    <span data-lang="ru">ОЖИДАНИЕ СИГНАЛА СООБЩЕСТВА</span>
                </div>
                <video id="tvVideoPlayer" playsinline style="display: none;"></video>
                <div class="scanlines"></div>
                <div class="crt-overlay"></div>
                <div class="vhs-noise"></div>
                <div class="osd-text top-right osd-blink" id="osdPause" style="display: none; align-items: center; gap: 8px;">
                    PAUSE
                    <svg viewBox="0 0 24 24" style="width: 1em; height: 1em; fill: currentColor; filter: drop-shadow(2px 2px 0px #000) drop-shadow(0 0 10px #00ff00);">
                        <rect x="6" y="4" width="4" height="16" />
                        <rect x="14" y="4" width="4" height="16" />
                    </svg>
                </div>
                <!-- НОВЫЙ БЛОК ЗАГРУЗКИ -->
                <div class="osd-text center osd-blink" id="tvLoading" style="display: none;">BUFFERING...</div>
            </div>

            <div class="tv-controls-bar">
                <div class="breadcrumbs" style="flex-grow: 0; min-width: auto;">
                    <span class="bc-text" id="localTimeClock">00:00</span>
                </div>
                <div class="tv-actions-group">
                    <div class="toggle-block">
                        <div class="toggle-btn" onclick="appRLTV.changeChannel('prev')" title="Previous">
                            <svg viewBox="0 0 24 24">
                                <polygon points="17 20 7 12 17 4 17 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                                <line x1="5" y1="4" x2="5" y2="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                            </svg>
                        </div>
                        <div class="toggle-btn active" id="btnPause" onclick="appRLTV.togglePause()" title="Pause/Play">
                            <svg viewBox="0 0 24 24">
                                <rect x="7" y="5" width="3" height="14" rx="1" fill="none" stroke="currentColor" stroke-width="1.5" />
                                <rect x="14" y="5" width="3" height="14" rx="1" fill="none" stroke="currentColor" stroke-width="1.5" />
                            </svg>
                        </div>
                        <div class="toggle-btn" onclick="appRLTV.changeChannel('next')" title="Next">
                            <svg viewBox="0 0 24 24">
                                <polygon points="7 4 17 12 7 20 7 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                                <line x1="19" y1="4" x2="19" y2="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                            </svg>
                        </div>
                        <div class="vol-box">
                            <input type="text" id="volInput" value="0" inputmode="numeric" maxlength="3">
                            <span>%</span>
                        </div>
                    </div>
                    <div class="vol-slider-wrap">
                        <input type="range" class="vol-slider" id="volSlider" min="0" max="100" step="1" value="0">
                    </div>
                </div>
            </div>
        </div>

        <div class="content-card">
            <div class="info-text">
                <div data-lang="en">
                    <h2>The loading screen is yours</h2>
                    <p>Compiling shaders is a boring routine. I decided to turn loading screens into in-game television through the <span class="highlight">#RaceLegendsTV</span> project. Caught an epic moment on stream or prepared interesting game info? Edit a video of max 3-5 minutes and upload it to YouTube or TikTok with the hashtag <span class="highlight">#RaceLegendsTV</span>. I will embed the best videos into the game as stylized TV commercials for our local fictional social network. Players will see your content, and at the end of the video, your real QR code with a link to the original video will appear. You make a great show, and I give you a <span class="highlight">free audience</span>.</p>
                </div>
                <div data-lang="ru">
                    <h2>Экран загрузки принадлежит вам</h2>
                    <p>Компиляция шейдеров — скучная рутина. Я решил превратить экраны загрузки во внутриигровое телевидение через проект <span class="highlight">#RaceLegendsTV</span>. Засняли эпичный момент со стрима или подготовили интересную информацию по игре? Смонтируйте ролик длиной максимум 3-5 минут и заливайте в YouTube или TikTok с хештегом <span class="highlight">#RaceLegendsTV</span>. Лучшие видео я зашью в игру в виде стилизованной ТВ-рекламы нашей местной выдуманной соцсети. Игроки увидят ваш контент, а в конце ролика появится ваш реальный QR-код со ссылкой на оригинальное видео. Вы делаете классное шоу, а я даю вам <span class="highlight">бесплатную аудиторию</span>.</p>
                </div>
            </div>
            <div class="info-console"><canvas class="mini-console" data-type="rltv_upload"></canvas></div>
        </div>

        <div class="content-card">
            <div class="info-text">
                <div data-lang="en">
                    <h2>Shoot your commercial</h2>
                    <p>#RaceLegendsTV is also a chance to <span class="highlight">expand the game's lore</span>. I give complete freedom for creativity. Shoot an absurd commercial for a fictional product from the Race Legends universe. Sell the viewers a can of "liquid meat", make a video in the spirit of crazy Thai ads, or record fake news. The main rule is to keep it within the same 3-5 minutes. If the video is high quality and fits the vibe, I add it to the rotation, and it becomes <span class="highlight">official television canon</span>.</p>
                </div>
                <div data-lang="ru">
                    <h2>Снимай свою рекламу</h2>
                    <p>#RaceLegendsTV — это еще и шанс <span class="highlight">расширить лор игры</span>. Я даю полную свободу для креатива. Снимите абсурдную рекламу выдуманного продукта из вселенной Race Legends. Продайте зрителям банку «жидкого мяса», сделайте ролик в духе безумной тайской рекламы или запишите фейковые новости. Главное правило — уложиться в те же 3-5 минут. Если видео качественное и попадает в вайб — я добавляю его в ротацию, и оно становится <span class="highlight">официальным телевизионным каноном</span>.</p>
                </div>
            </div>
            <div class="info-console"><canvas class="mini-console" data-type="rltv_clapper"></canvas></div>
        </div>
    `,

    // ==========================================
    // PATCHNOTES
    // ==========================================
    'patchnotes': `
        <div class="search-block" id="postsSearchBlock">
            <div class="pn-input-wrap">
                <svg class="search-icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input type="text" class="pn-input" id="searchInput" placeholder="Поиск" autocomplete="off">
            </div>
            <!-- ФИЛЬТР ПО ПРОЕКТАМ -->
            <div class="pn-select-wrap cat-box">
                <select class="pn-select" id="categorySelect">
                    <option value="all">All / Все проекты</option>
                    <option value="#RaceLegends">Race Legends</option>
                    <option value="#FractalForge">Fractal Forge</option>
                    <option value="#RaceLegendsTV">#RaceLegendsTV</option>
                </select>
            </div>
            <!-- ФИЛЬТР ПО ДАТЕ -->
            <div class="pn-select-wrap sort-box">
                <select class="pn-select" id="sortSelect">
                    <option value="newest">Newest / Новые</option>
                    <option value="oldest">Oldest / Старые</option>
                </select>
            </div>
        </div>

        <div id="postsList" style="display: flex; flex-direction: column; gap: 18px; width: 100%;"></div>

        <div id="singlePostView" style="display: none; flex-direction: column; gap: 18px; width: 100%;">
            <!-- ПРАВИЛЬНАЯ ФИРМЕННАЯ КНОПКА НАЗАД -->
            
            <div id="singlePostContent" style="display: flex; flex-direction: column; gap: 18px; width: 100%;"></div>
        </div>
    `
};

const PAGE_TITLES = {
    'rl': { en: 'Race Legends', ru: 'Race Legends' },
    'ff': { en: 'Fractal Forge', ru: 'Fractal Forge' },
    'rltv': { en: '#RaceLegendsTV', ru: '#RaceLegendsTV' },
    'patchnotes': { en: 'Articles', ru: 'Статьи' }
};