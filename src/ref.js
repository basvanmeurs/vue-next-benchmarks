function go() {
  const { ref, computed, watch, watchEffect } = Vue;

  const suite = new Benchmark.Suite();

  bench(() => {
    const v = ref(100);
    return suite.add("create ref", () => {
      const v = ref(100);
    });
  });

  bench(() => {
    let i = 0;
    const v = ref(100);
    return suite.add("write ref", () => {
      v.value = i++;
    });
  })

  bench(() => {
    const v = ref(100);
    return suite.add("read ref", () => {
      const i = v.value;
    });
  });

  bench(() => {
    let i = 0;
    const v = ref(100);
    return suite.add("write/read ref", () => {
      v.value = i++;
      const q = v.value;
    });
  });

  return suite;
}