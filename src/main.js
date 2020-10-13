const queryParams = new URLSearchParams(window.location.search);
const version = queryParams.get("v");
const available = ["ref", "computed", "watch", "watchEffect", "mix"];

const urlInput = document.getElementById("url");
urlInput.value = version || "3.0.0";

const benchmarksInput = document.getElementById("benchmarks");
benchmarksInput.value = queryParams.get("b") || available.join(",");

const abortButton = document.getElementById("abort");
const startButton = document.getElementById("start");
const results = document.getElementById("results");

const standaloneInput = document.getElementById("standalone");
const iterationsInput = document.getElementById("iterations");

// This allows aborting and outputting while tests are being run.
Benchmark.options.async = true;

function log(...args) {
  console.log(...args);
}

function addBenchmark(name) {
  const tr = document.createElement('tr');
  tr.innerHTML += `<th colspan="3" class="benchmark"></th>`
  tr.firstElementChild.innerText = name;
  results.appendChild(tr);
}

function addResult(name, result, fn) {
  const tr = document.createElement('tr');
  tr.innerHTML += `<th></th><td></td><td class="code"></td>`
  tr.children.item(0).innerText = name;
  tr.children.item(1).innerText = result;
  tr.children.item(2).innerText = fn.toString();
  results.appendChild(tr);
}

// @see https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
const semverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

function getUrl() {
  let url = urlInput.value;
  if (url.trim() === "") {
    url = "vue.global.js";
  } else if (semverRegex.test(url)) {
    url = `https://cdnjs.cloudflare.com/ajax/libs/vue/${url}/vue.global.js`;
  }
  return url;
}

window.start = function() {
  const benchmarks = benchmarksInput.value.trim() !== "" ? benchmarksInput.value.split(",") : available;

  document.getElementById("started").style.display = "block";

  let url = getUrl();

  log("Use Vue3: " + url);
  log("Benchmarks: " + benchmarks.join(","));
  log("Available: " + available.join(","));

  results.innerHTML = `<tr><th>Benchmark</th><th>Result</th><th>Code</th></tr>`;

  abortButton.removeAttribute("disabled");
  startButton.setAttribute("disabled", "disabled");

  injectScript(url).then(() => {
    runTests(benchmarks).then(() => {
      startButton.removeAttribute("disabled");
      abortButton.setAttribute("disabled", "disabled");
      alert("All benchmarks finished");
    });
  });
}

let suite;
let aborted = false;
window.abort = function() {
  startButton.removeAttribute("disabled");
  abortButton.setAttribute("disabled", "disabled");

  if (suite) {
    suite.abort();
  }
  aborted = true;
}

function bench(cb) {
  const suite = cb();
  const benchmark = suite[suite.length - 1];
  benchmark.bench = cb;
}

async function runTests(benchmarks) {
  for (let i = 0, n = benchmarks.length; i < n; i++) {
    const name = benchmarks[i];

    window.go = undefined;
    await injectScript(`src/${name}.js`);

    suite = go();

    log("Benchmark: " + name);
    addBenchmark(name);

    suite.on("cycle", function(event) {
      addResult(event.target.name, event.target.toString().substr(event.target.name.length + 3), event.target.bench);
      log(String(event.target));
    });

    suite.run();

    await new Promise((resolve) => {
      suite.on("complete", resolve);
    });

  }
}

window.standalone = function() {
  const v = standaloneInput.value;
  const index = v.indexOf(":");
  if (index === -1) {
    alert("Format: {name}:{benchmark}");
  } else {
    const name = v.substr(0, index).trim();
    const bench = v.substr(index + 1).trim();
    startStandalone(name, bench);
  }
}

async function startStandalone(name, benchmarkName) {
  let url = getUrl();

  log("Use Vue3: " + url);
  log("Benchmarks: " + name + ":" + benchmarkName);

  await injectScript(url);

  window.go = undefined;
  await injectScript(`src/${name}.js`);

  suite = go();

  let bench;
  for (const key in suite) {
    if (parseInt(key) >= 0) {
      const b = suite[key];
      if (b.name === benchmarkName) {
        bench = b;
      }
    }
  }

  if (!bench) {
    alert("Benchmark not found.");
    return;
  }

  const iterations = parseInt(iterationsInput.value.replace(/_/g, "")) || 1e4;
  log("Iterations: " + iterations);

  const f = bench.fn;
  console.profile(benchmarkName);
  for (let i = 0; i < iterations; i++) {
    f();
  }
  console.profileEnd(benchmarkName);
}

function injectScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.addEventListener('load', resolve);
    script.addEventListener('error', e => reject(e.error));
    document.head.appendChild(script);
  });
}


