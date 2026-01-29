import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, tap } from "rxjs";
import { PrometheusService } from "src/modules/prometheus/prometheus.service";

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  constructor(private readonly prometheus: PrometheusService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    const start = process.hrtime.bigint();

    return next.handle().pipe(
      tap(() => {
        const duration =
          Number(process.hrtime.bigint() - start) / 1e9;

        const labels = {
          method: req.method,
          route: req.route?.path || "unknown",
          status: res.statusCode,
        };

        this.prometheus.httpRequestsTotal.inc(labels);
        this.prometheus.httpRequestDuration.observe(
          labels,
          duration,
        );
      }),
    );
  }
}
