function go() {
  const { ref, computed, watch, watchEffect } = Vue;

  const suite = new Benchmark.Suite();

  bench(() => {
    const v = ref(100);
    const c = computed(() => v.value * 2);
    const c2 = computed(() => c.value * 2);
    const v2 = ref(10);

    const w = watch(c2, (v) => {
      v2.value = v;
    });

    let ctr = 0;
    const we = watchEffect(() => {
      const v = c.value + v2.value;
    });

    return suite.add("mix of dependent refs, computed, watch and watchEffect", function(deferred) {
      v.value += 50;
      Vue.nextTick(() => deferred.resolve());
    }, { defer: true });
  });

  return suite;
}