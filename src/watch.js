function go() {
  const { ref, computed, watch, watchEffect,  } = Vue;

  const suite = new Benchmark.Suite();

  bench(() => {
    return suite.add("create watcher", () => {
      const v = ref(100);
      const w = watch(v, (v) => {
      });
    });
  });

  bench(() => {
    let c = 0;
    const v = ref(100);
    const w = watch(v, (v) => {
    });
    let i = 0;
    return suite.add("update ref to trigger watcher (scheduled but not executed)", () => {
      v.value = i++;
    });
  })

  bench(() => {
    let c = 0;
    const v = ref(100);
    const w = watch(v, (v) => {
    });
    let i = 0;
    return suite.add("update ref to trigger watcher (executed)", function(deferred) {
      v.value = i++;
      Vue.nextTick(() => deferred.resolve());
    }, { defer: true });
  })

  return suite;
}