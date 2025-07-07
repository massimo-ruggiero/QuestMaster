(define (problem nova-cryon-6-investigation)
  (:domain hollow-star-protocol)

  (:objects
    recon-team - operative
    landing-zone data-core althea-chamber - location
    security-controls - subsystem
    blackbox-logs - data
  )

  (:init
    ;; Initial operative location
    (at recon-team landing-zone)

    ;; World connectivity
    (path-exists landing-zone data-core)
    (path-exists data-core landing-zone)
    (path-exists data-core althea-chamber)
    (path-exists althea-chamber data-core)

    ;; Initial state of obstacles and systems
    (data-is-corrupted blackbox-logs)
    (subsystem-is-locked security-controls)
    (althea-status-unknown)

    ;; Initial hazard state
    (not (radiation-flare-active))
  )

  (:goal (and
    (protocol-resolved)
  ))
)