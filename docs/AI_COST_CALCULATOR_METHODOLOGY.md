# HEZQEN Labs: API vs Self-Hosted AI Cost Break-Even

## Model

The calculator compares monthly token-based API charges with a fixed monthly self-hosted GPU cost.

Let:
- (R) = requests per month
- (I) = input tokens per request
- (O) = output tokens per request
- (P_i) = API input price per million tokens
- (P_o) = API output price per million tokens
- (G) = GPU count
- (C_h) = hourly cost per GPU
- (H) = GPU hours per month
- (X) = additional monthly infrastructure overhead
- (A) = monthly amortized GPU purchase cost (for owned hardware)
- (E) = monthly engineering labour cost
- (C_o) = monthly on-call and operations cost

API cost per request:

`(I × P_i + O × P_o) / 1,000,000`

Monthly API cost:

`R × API cost per request`

Monthly self-hosted cost:

`G × C_h × H + X + A + E + C_o`

GPU rental cost and owned-GPU amortization are alternative inputs: for rented GPUs, enter the hourly rental rate and set amortization to zero; for owned GPUs, set hourly rental cost to zero and enter the monthly amortized purchase cost.

Break-even monthly request volume:

`ceil(self-hosted monthly cost / API cost per request)`

If API cost per request is zero, break-even volume is not reached.

## Assumptions

- Prices are user-supplied USD per million input/output tokens.
- GPU rental cost is a flat hourly rate for every GPU for the entered number of billable/provisioned hours. Idle time remains billable when the reservation stays active.
- Owned GPU cost is represented by a user-supplied monthly amortization amount; do not also enter rental cost for the same GPU.
- Additional infrastructure overhead, GPU purchase amortization, engineering labour and on-call/operations are user-supplied monthly amounts.
- GPU purchase amortization, engineering and on-call costs default to zero when the user has no estimate; this is an explicit assumption, not evidence that the work is free.
- The model compares costs only; it does not infer capacity, utilization or performance.

## Exclusions

Model quality, utilization inefficiency, autoscaling, networking, storage beyond the overhead input, redundancy, taxes, discounts, minimum commitments and workload-specific throughput constraints are excluded. GPU purchase amortization, engineering labour and on-call costs are included only when entered by the user. GPU capacity must be independently validated.

The calculator is a planning aid, not a procurement recommendation or vendor quote.
