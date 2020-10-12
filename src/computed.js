function go() {
  const { ref, computed, watch, watchEffect } = Vue;

  const suite = new Benchmark.Suite();

  bench(() => {
    return suite.add("create computed", () => {
      const c = computed(() => 100);
    });
  });

  bench(() => {
    let i = 0;
    const o = ref(100);
    return suite.add("write independent ref dep", () => {
      o.value = i++;
    });
  });

  bench(() => {
    const v = ref(100);
    const c = computed(() => {
      return v.value * 2
    });
    let i = 0;
    return suite.add("write ref, don't read computed (never invoked)", () => {
      v.value = i++;
    });
  })

  bench(() => {
    const v = ref(100);
    const c = computed(() => {
      return v.value * 2
    });
    const cv = c.value;
    let i = 0;
    return suite.add("write ref, don't read computed (invoked)", () => {
      v.value = i++;
    });
  })

  bench(() => {
    const v = ref(100);
    const c = computed(() => {
      return v.value * 2
    });
    let i = 0;
    return suite.add("write ref, read computed", () => {
      v.value = i++;
      const cv = c.value;
    });
  });


  bench(() => {
    const v = ref(100);
    const computeds = [];
    for (let i = 0, n = 1000; i < n; i++) {
      const c = computed(() => {
        return v.value * 2
      });
      computeds.push(c);
    }
    let i = 0;
    return suite.add("write ref, don't read 1000 computeds (never invoked)", () => {
      v.value = i++;
    });
  })

  bench(() => {
    const v = ref(100);
    const computeds = [];
    for (let i = 0, n = 1000; i < n; i++) {
      const c = computed(() => {
        return v.value * 2
      });
      const cv = c.value;
      computeds.push(c);
    }
    let i = 0;
    return suite.add("write ref, don't read 1000 computeds (invoked)", () => {
      v.value = i++;
    });
  });

  bench(() => {
    const v = ref(100);
    const computeds = [];
    for (let i = 0, n = 1000; i < n; i++) {
      const c = computed(() => {
        return v.value * 2
      });
      const cv = c.value;
      computeds.push(c);
    }
    let i = 0;
    return suite.add("write ref, read 1000 computeds", () => {
      v.value = i++;
      computeds.forEach(c => c.value);
    });
  });

  return suite;
}