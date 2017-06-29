export class AsyncBusy {
      busy = false;

      async withBusy(promise: Promise<any>) {
        if (this.busy) {
          return;
        }

        this.busy = true;

        try {
          await promise;
        } finally {
          this.busy = false;
        }
      }
}
