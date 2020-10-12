function go() {
  const { ref, computed, watch, watchEffect,  } = Vue;

  const suite = new Benchmark.Suite();

  bench(() => {
    return suite.add("create watchEffect", () => {
      const we = watchEffect(() => {
      });
    });
  });

  bench(() => {
    let c = 0;
    const v = ref(100);
    const w = watchEffect(v, (v) => {
      const v2 = v.value;
    });
    let i = 0;
    return suite.add("update ref to trigger watchEffect (scheduled but not executed)", () => {
      v.value = i++;
    });
  })

  bench(() => {
    let c = 0;
    const v = ref(100);
    const w = watchEffect(v, (v) => {
      const v2 = v.value;
    });
    let i = 0;
    return suite.add("update ref to trigger watchEffect (scheduled but not executed)", function(deferred) {
      v.value = i++;
      Vue.nextTick(() => deferred.resolve());
    }, { defer: true });
  })

  return suite;
}