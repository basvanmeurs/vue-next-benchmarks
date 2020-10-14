function go() {
  const { ref, computed, reactive } = Vue;

  const suite = new Benchmark.Suite();

  bench(() => {
    return suite.add("create reactive obj", () => {
      const r = reactive({a: 1});
    });
  });

  bench(() => {
    let i = 0;
    const r = reactive({a: 1});
    return suite.add("write reactive obj property", () => {
      r.a = i++;
    });
  });

  bench(() => {
    const r = reactive({a: 1});
    const c = computed(() => {
      return r.a * 2
    });
    let i = 0;
    return suite.add("write reactive obj, don't read computed (never invoked)", () => {
      r.a = i++;
    });
  })

  bench(() => {
    const r = reactive({a: 1});
    const c = computed(() => {
      return r.a * 2
    });
    const cv = c.value;
    let i = 0;
    return suite.add("write reactive obj, don't read computed (invoked)", () => {
      r.a = i++;
    });
  })

  bench(() => {
    const r = reactive({a: 1});
    const c = computed(() => {
      return r.a * 2
    });
    let i = 0;
    return suite.add("write reactive obj, read computed", () => {
      r.a = i++;
      const cv = c.value;
    });
  });

  bench(() => {
    const r = reactive({a: 1});
    const computeds = [];
    for (let i = 0, n = 1000; i < n; i++) {
      const c = computed(() => {
        return r.a * 2
      });
      computeds.push(c);
    }
    let i = 0;
    return suite.add("write reactive obj, don't read 1000 computeds (never invoked)", () => {
      r.a = i++;
    });
  })

  bench(() => {
    const r = reactive({a: 1});
    const computeds = [];
    for (let i = 0, n = 1000; i < n; i++) {
      const c = computed(() => {
        return r.a * 2
      });
      const cv = c.value;
      computeds.push(c);
    }
    let i = 0;
    return suite.add("write reactive obj, don't read 1000 computeds (invoked)", () => {
      r.a = i++;
    });
  });

  bench(() => {
    const r = reactive({a: 1});
    const computeds = [];
    for (let i = 0, n = 1000; i < n; i++) {
      const c = computed(() => {
        return r.a * 2
      });
      computeds.push(c);
    }
    let i = 0;
    return suite.add("write reactive obj, read 1000 computeds", () => {
      r.a = i++;
      computeds.forEach(c => c.value);
    });
  });

  bench(() => {
    const reactives = [];
    for (let i = 0, n = 1000; i < n; i++) {
      reactives.push(reactive({a: i}));
    }
    const c = computed(() => {
      let total = 0;
      reactives.forEach(r => total += r.a);
      return total;
    });
    let i = 0;
    const n = reactives.length;
    return suite.add("1000 reactive objs, 1 computed", () => {
      reactives[i++ % n].a++;
      const v = c.value;
    });
  });

  return suite;
}