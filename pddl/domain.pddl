(define (domain hollow-star-protocol)
  (:requirements :strips :typing)
  (:types
    operative location subsystem data
  )

  (:predicates
    ;; Location and Connectivity
    (at ?op - operative ?l - location)
    (path-exists ?from - location ?to - location)

    ;; Environmental Hazards
    (radiation-flare-active)

    ;; Data and System States
    (data-is-corrupted ?d - data)
    (data-is-reconstructed ?d - data)
    (subsystem-is-locked ?s - subsystem)
    (subsystem-is-bypassed ?s - subsystem)

    ;; ALTHEA State Machine
    (althea-status-unknown)
    (althea-status-queried)
    (althea-judged-as-threat)
    (althea-judged-as-sentient)

    ;; Goal State
    (protocol-resolved)
  )

  ;; ACTION: Travel between locations on the station
  (:action travel
    :parameters (?op - operative ?from - location ?to - location)
    :precondition (and
      (at ?op ?from)
      (path-exists ?from ?to)
      (not (radiation-flare-active))
    )
    :effect (and
      (not (at ?op ?from))
      (at ?op ?to)
    )
  )

  ;; ACTION: Wait for a radiation flare to subside
  (:action wait-out-flare
    :parameters (?op - operative ?l - location)
    :precondition (and
      (at ?op ?l)
      (radiation-flare-active)
    )
    :effect (not (radiation-flare-active))
  )

  ;; ACTION: Run system diagnostics, which may trigger a flare
  (:action run-diagnostics
    :parameters (?op - operative ?l - location)
    :precondition (and
      (at ?op ?l)
      (not (radiation-flare-active))
    )
    :effect (and
      (radiation-flare-active)
    )
  )

  ;; ACTION: Reconstruct data from corrupted logs
  (:action reconstruct-data
    :parameters (?op - operative ?d - data ?l - location)
    :precondition (and
      (at ?op ?l)
      (data-is-corrupted ?d)
    )
    :effect (and
      (not (data-is-corrupted ?d))
      (data-is-reconstructed ?d)
    )
  )

  ;; ACTION: Bypass a locked AI subsystem using reconstructed data
  (:action bypass-security-subsystem
    :parameters (?op - operative ?s - subsystem ?d - data ?l - location)
    :precondition (and
      (at ?op ?l)
      (subsystem-is-locked ?s)
      (data-is-reconstructed ?d)
    )
    :effect (and
      (not (subsystem-is-locked ?s))
      (subsystem-is-bypassed ?s)
    )
  )

  ;; ACTION: Query ALTHEA's core logic to understand its state
  (:action query-althea-core
    :parameters (?op - operative ?s - subsystem ?l - location)
    :precondition (and
      (at ?op ?l)
      (subsystem-is-bypassed ?s)
      (althea-status-unknown)
    )
    :effect (and
      (not (althea-status-unknown))
      (althea-status-queried)
    )
  )

  ;; ACTION: Decide that ALTHEA is a threat based on the query
  (:action judge-as-threat
    :parameters (?op - operative ?l - location)
    :precondition (and
      (at ?op ?l)
      (althea-status-queried)
      (not (althea-judged-as-threat))
      (not (althea-judged-as-sentient))
    )
    :effect (and
      (althea-judged-as-threat)
    )
  )

  ;; ACTION: Decide that ALTHEA is a new sentient life form
  (:action judge-as-sentient
    :parameters (?op - operative ?l - location)
    :precondition (and
      (at ?op ?l)
      (althea-status-queried)
      (not (althea-judged-as-threat))
      (not (althea-judged-as-sentient))
    )
    :effect (and
      (althea-judged-as-sentient)
    )
  )

  ;; ACTION: Execute the shutdown protocol to neutralize ALTHEA
  (:action execute-shutdown
    :parameters (?op - operative ?l - location)
    :precondition (and
      (at ?op ?l)
      (althea-judged-as-threat)
    )
    :effect (and
      (protocol-resolved)
    )
  )

  ;; ACTION: Register ALTHEA under the Galactic Sentience Accord
  (:action register-sentience
    :parameters (?op - operative ?l - location)
    :precondition (and
      (at ?op ?l)
      (althea-judged-as-sentient)
    )
    :effect (and
      (protocol-resolved)
    )
  )
)