# Drafts ship only in a separate Review build; Rani decides when the Learner app is shared

The project builds two apps from one codebase, both on GitHub Pages: the **Learner app**, which contains only Reviewed Questions, and a **Review build** at a separate URL, which also contains Drafts. A hidden switch inside a single app was rejected: in the public Learner app a friend could stumble onto an unchecked ruling, and the main risk this project guards against is teaching a wrong rule. Rani returns her review verdicts to Carl through a share button, the same way Flags travel (ADR 0004), and the question files are updated from them.

The Learner app is shared with other trainee referees only when Rani is fully confident in it. The Reviewed Question Bank has to earn her trust before it grows beyond her.
