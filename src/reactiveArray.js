function go() {
  const { ref, computed, reactive, shallowRef, triggerRef, readonly, toRaw } = Vue;

  const suite = new Benchmark.Suite();

  for (let amount = 10; amount < 1e6; amount *= 10) {
    bench(() => {
      const rawArray = [];
      for (let i = 0, n = amount; i < n; i++) {
        rawArray.push(i)
      }
      const r = reactive(rawArray);
      const c = computed(() => {
        return r.reduce((v, a) => a + v, 0)
      });

      return suite.add(`reduce *reactive* array, ${amount} elements`, () => {
        for (let i = 0, n = r.length; i < n; i++) {
          r[i]++
        }
        const value = c.value
      });
    });

    bench(() => {
      const rawArray = [];
      for (let i = 0, n = amount; i < n; i++) {
        rawArray.push(i)
      }
      const r = reactive(rawArray);
      const c = computed(() => {
        return r.reduce((v, a) => a + v, 0)
      });

      return suite.add(`reduce *reactive* array, ${amount} elements, only change first value`, () => {
        r[0]++
        const value = c.value
      });
    });

    bench(() => {
      const rawArray = [];
      for (let i = 0, n = amount; i < n; i++) {
        rawArray.push(i)
      }
      const r = reactive({ arr: readonly(rawArray) });
      const c = computed(() => {
        return r.arr.reduce((v, a) => a + v, 0)
      });

      return suite.add(`reduce *readonly* array, ${amount} elements`, () => {
        r.arr = r.arr.map(v => v + 1)
        const value = c.value
      });
    });

    bench(() => {
      const rawArray = [];
      for (let i = 0, n = amount; i < n; i++) {
        rawArray.push(i)
      }
      const r = shallowRef(rawArray);
      const c = computed(() => {
        return r.value.reduce((v, a) => a + v, 0)
      });

      return suite.add(`reduce *raw* array, copied, ${amount} elements`, () => {
        r.value = r.value.map(v => v + 1)
        const value = c.value
      });
    });

    bench(() => {
      const rawArray = [];
      for (let i = 0, n = amount; i < n; i++) {
        rawArray.push(i)
      }
      const r = shallowRef(rawArray);
      const c = computed(() => {
        return r.value.reduce((v, a) => a + v, 0)
      });

      return suite.add(`reduce *raw* array, manually triggered, ${amount} elements`, () => {
        for (let i = 0, n = rawArray.length; i < n; i++) {
          rawArray[i]++
        }
        triggerRef(r);
        const value = c.value
      });
    });

  }

  return suite;
}